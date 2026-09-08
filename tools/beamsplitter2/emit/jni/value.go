/*
 * Copyright (C) 2026 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package jni

import (
	"fmt"
	"strings"

	"beamsplitter2/emit"
	"beamsplitter2/ir"
)

// A value struct is one that crosses as a Java object holding the members
// themselves, rather than as an address.
//
// Java has no value type, so this is the only honest way to carry one: the Java
// class has a field per member and the shim reads them back out. It is also the
// only way the methods on such a struct can work at all. A filament::Aabb is a
// pair of vectors, never allocated by the engine and never handed out by
// address, so a binding that takes it as a jlong is one no caller can reach --
// which is what they were before this file.
//
// ponytail: the field ids are looked up on every call. Caching them means a
// static per class filled in from JNI_OnLoad, which is a lifetime and a load
// order to get right; add it when a call site is hot enough to measure.

// values decides which structs cross this way, once per parsed API. It is a
// question about types alone -- what the members are -- so it can be answered
// before any verdict is reached, which is what keeps it out of the fixed point.
type values map[string]*ir.Class

// Binding is what both halves of the bindings need beyond any one method: which
// structs cross as values, and which Java package each class lives in. Both are
// properties of the whole target rather than of a type, and a shim and a
// declaration that disagree about either produce a symbol nothing looks for, so
// they are computed once and handed to both emitters.
type Binding struct {
	values   values
	packages map[string]string // class name -> the Java package its module declares
	names    map[string]string // class name -> the Java class it is declared as
}

// NewBinding reads the API and the module layout for both.
func NewBinding(api *ir.API, modules []Module) Binding {
	b := Binding{values: valueStructs(api), packages: map[string]string{}}
	short := map[string]string{}
	for _, m := range modules {
		for _, c := range api.Classes {
			if m.Owns(c.Header) {
				b.packages[c.CppName] = m.Package
				short[c.CppName] = javaClass(c)
			}
		}
	}
	// An underscore, not a dollar: a dollar already means nesting here, and Java
	// would read backend.Viewport as a package.
	b.names = emit.Disambiguate(short, "_")
	return b
}

// JavaClass is the binary name of the class the natives belong to, relative to
// its package, and the only one that agrees with what the Java side declares.
func (b Binding) JavaClass(c *ir.Class) string {
	if name, ok := b.names[c.CppName]; ok {
		return name
	}
	return javaClass(c)
}

// IsValue reports a type that crosses as a Java object holding the members.
func (b Binding) IsValue(t *ir.Type) bool { return b.values.isValue(t) }

// Class is the declaration behind a value type.
func (b Binding) Class(t *ir.Type) *ir.Class { return b.values[t.Target] }

// JavaClassName is the name a Java declaration spells a class with: the bare
// name where the caller is in the same package, and the qualified one where it
// is not. A generated file never imports, so the qualified name is written out.
func (b Binding) JavaClassName(c *ir.Class, from string) string {
	name := strings.ReplaceAll(b.JavaClass(c), "$", ".")
	if pkg := b.packages[c.CppName]; pkg != "" && pkg != from {
		return pkg + "." + name
	}
	return name
}

// JavaType is JavaType with the value structs added: those cross as the Java
// class holding the members, not as an address.
func (b Binding) JavaType(t *ir.Type, from string) string {
	if b.IsValue(t) {
		return b.JavaClassName(b.values[t.Target], from)
	}
	return JavaType(t)
}

// Members is what the Java class declares a field for, and what the helpers copy.
// The two have to be the same list, so there is only one.
func (b Binding) Members(c *ir.Class) []*ir.Field { return members(c) }

// Owns reports a class the bindings make and therefore have to destroy.
//
// A native that news something is only safe beside one that deletes it, so the
// two are decided together and both halves of the binding ask the same
// question. A value struct is not one of these: it is copied, not allocated.
// Nor is a type Filament keeps the destructor of to itself, which is most of
// what the engine owns -- those are made and unmade through the engine.
func (b Binding) Owns(c *ir.Class) bool {
	if b.values[c.CppName] != nil || c.NoPublicDestructor || c.Abstract {
		return false
	}
	for _, m := range c.Constructors {
		if m.Bind {
			return true
		}
	}
	return false
}

// Destructor is the shim that unmakes one.
func (b Binding) Destructor(pkg string, c *ir.Class, overloaded bool) string {
	symbol := "Java_" + mangle(pkg+"."+b.JavaClass(c)) + "_nDestroy"
	if overloaded {
		symbol += "__J"
	}
	return fmt.Sprintf(`extern "C" JNIEXPORT void JNICALL
%s(JNIEnv*, jclass, jlong nativeObject) {
    delete (%s*) nativeObject;
}
`, symbol, c.Spelling())
}

// Descriptor is the JVM name of a type, which is what a mangled symbol carries.
// It differs from javaDescriptor only for a value, whose descriptor spells the
// package the class is really in.
func (b Binding) Descriptor(t *ir.Type) string {
	if b.IsValue(t) {
		c := b.values[t.Target]
		return "L" + strings.ReplaceAll(b.packages[c.CppName], ".", "/") + "/" + b.JavaClass(c) + ";"
	}
	return javaDescriptor(t)
}

func valueStructs(api *ir.API) values {
	out := values{}
	// A struct can hold another, so whether one qualifies depends on what already
	// does. Grow the set until it stops growing, which it must: each pass either
	// adds a struct or ends.
	for changed := true; changed; {
		changed = false
		for _, c := range api.Classes {
			if out[c.CppName] != nil || c.Tag != "struct" || c.Template || c.Mutable() {
				continue
			}
			fields := members(c)
			if len(fields) == 0 {
				continue
			}
			// Every member has to cross, or the copy on the far side is not the value
			// that was sent. A struct that loses a member is worse than one refused.
			all := true
			for _, f := range fields {
				if !carries(f.Type) && !out.isValue(f.Type) {
					all = false
					break
				}
			}
			if all {
				out[c.CppName] = c
				changed = true
			}
		}
	}
	return out
}

// isValue reports a type that crosses as the Java object holding the members.
//
// A const reference does too. It promises not to write, so a copy is the same
// value the callee would have seen -- and Filament passes these options structs
// that way everywhere. A mutable reference is an out-parameter, where a copy
// would drop whatever the callee wrote into it, so it stays an address.
func (v values) isValue(t *ir.Type) bool {
	if v[t.Target] == nil {
		return false
	}
	return t.Indirection == ir.Direct || (t.Indirection == ir.Reference && t.Const)
}

// members is what a caller of this struct can see and set.
func members(c *ir.Class) []*ir.Field {
	var out []*ir.Field
	for _, f := range c.Fields {
		// A static member is not part of the value, and a bit-field has no address
		// for anything to reach.
		if f.Access == "public" && !f.Static && !f.Bitfield {
			out = append(out, f)
		}
	}
	return out
}

// carries reports a member type the read and write helpers can copy without
// asking about anything else. A member that is itself a value struct is handled
// too, but only once that struct is known to be one, which is what the fixed
// point above is for. A pointer or a string is not refused on principle; it is
// simply not written yet, and the struct holding one stays an address.
func carries(t *ir.Type) bool {
	if t.Indirection != ir.Direct {
		return false
	}
	if _, ok := scalars[t.Kind]; ok {
		return t.Kind != ir.KindVoid
	}
	return t.Kind == ir.KindEnum || isNumbers(t)
}

// Fields is the members of a value struct, in declaration order.
func (v values) Fields(cppName string) []*ir.Field {
	if c, ok := v[cppName]; ok {
		return members(c)
	}
	return nil
}

// helperName is what the generated read and write functions are called. They are
// static, so two files converting the same struct are two copies rather than a
// duplicate symbol.
func (b Binding) readerName(c *ir.Class) string {
	return "read" + strings.ReplaceAll(b.JavaClass(c), "$", "_")
}

func (b Binding) writerName(c *ir.Class) string {
	return "write" + strings.ReplaceAll(b.JavaClass(c), "$", "_")
}

// helpers renders the pair of functions that copy one struct across.
func (b Binding) helpers(c *ir.Class) string {
	var sb strings.Builder
	class := strings.ReplaceAll(b.packages[c.CppName], ".", "/") + "/" + b.JavaClass(c)

	fmt.Fprintf(&sb, "// Copies %s to and from its Java counterpart, member by member.\n", c.Spelling())
	fmt.Fprintf(&sb, "static %s %s(JNIEnv* env, jobject obj) {\n", c.Spelling(), b.readerName(c))
	fmt.Fprintf(&sb, "    jclass cls = env->GetObjectClass(obj);\n    %s out;\n", c.Spelling())
	for _, f := range members(c) {
		sb.WriteString(b.readField(f))
	}
	sb.WriteString("    return out;\n}\n\n")

	fmt.Fprintf(&sb, "static jobject %s(JNIEnv* env, const %s& in) {\n", b.writerName(c), c.Spelling())
	fmt.Fprintf(&sb, "    jclass cls = env->FindClass(%q);\n", class)
	sb.WriteString("    jobject obj = env->NewObject(cls, env->GetMethodID(cls, \"<init>\", \"()V\"));\n")
	for _, f := range members(c) {
		sb.WriteString(b.writeField(f))
	}
	sb.WriteString("    return obj;\n}\n")
	return sb.String()
}

func (b Binding) readField(f *ir.Field) string {
	id := fmt.Sprintf("env->GetFieldID(cls, %q, %q)", f.Name, b.Descriptor(f.Type))
	if b.IsValue(f.Type) {
		// A member that is itself a value: the same pair of helpers, one level down.
		return fmt.Sprintf("    out.%s = %s(env, env->GetObjectField(obj, %s));\n",
			f.Name, b.readerName(b.Class(f.Type)), id)
	}
	if f.Type.Kind == ir.KindArray {
		// A C array is written into directly, which is what the region calls are for.
		elem := mathElement(f.Type)
		return fmt.Sprintf("    env->Get%sArrayRegion((%sArray) env->GetObjectField(obj, %s), 0, %d, out.%s);\n",
			elem.array, elem.jni, id, elements(f.Type), f.Name)
	}
	if f.Type.IsMath() {
		elem := mathElement(f.Type)
		return fmt.Sprintf(`    {
        %sArray a = (%sArray) env->GetObjectField(obj, %s);
        %s* p = env->Get%sArrayElements(a, nullptr);
        out.%s = *reinterpret_cast<%s*>(p);
        env->Release%sArrayElements(a, p, JNI_ABORT);
    }
`, elem.jni, elem.jni, id, elem.jni, elem.array, f.Name, f.Type.Canonical, elem.array)
	}
	cast := ""
	if f.Type.Kind == ir.KindEnum {
		cast = "(" + f.Type.Canonical + ") "
	}
	return fmt.Sprintf("    out.%s = %senv->Get%sField(obj, %s);\n",
		f.Name, cast, accessor(f.Type), id)
}

func (b Binding) writeField(f *ir.Field) string {
	id := fmt.Sprintf("env->GetFieldID(cls, %q, %q)", f.Name, b.Descriptor(f.Type))
	if b.IsValue(f.Type) {
		return fmt.Sprintf("    env->SetObjectField(obj, %s, %s(env, in.%s));\n",
			id, b.writerName(b.Class(f.Type)), f.Name)
	}
	if isNumbers(f.Type) {
		elem := mathElement(f.Type)
		n := elements(f.Type)
		source := fmt.Sprintf("reinterpret_cast<const %s*>(&in.%s)", elem.jni, f.Name)
		if f.Type.Kind == ir.KindArray {
			source = "in." + f.Name
		}
		return fmt.Sprintf(`    {
        %sArray a = env->New%sArray(%d);
        env->Set%sArrayRegion(a, 0, %d, %s);
        env->SetObjectField(obj, %s, a);
    }
`, elem.jni, elem.array, n, elem.array, n, source, id)
	}
	return fmt.Sprintf("    env->Set%sField(obj, %s, (%s) in.%s);\n",
		accessor(f.Type), id, jniType(f.Type), f.Name)
}

// accessor is the word in the middle of GetIntField. An enum is stored as its
// ordinal, so it is read as an int.
func accessor(t *ir.Type) string {
	if t.Kind == ir.KindEnum {
		return "Int"
	}
	return scalars[t.Kind].array
}

// elements is how many numbers a math value is.
func elements(t *ir.Type) int {
	if t.Cols > 0 {
		return t.Rows * t.Cols
	}
	if t.Rows > 0 {
		return t.Rows
	}
	return 4
}
