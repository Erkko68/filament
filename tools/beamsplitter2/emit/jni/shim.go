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

	"beamsplitter2/ir"
)

// A shim is one JNI entry point. There is no registration table as embind has:
// the JVM finds a native by the name of its symbol, so the whole binding is the
// name and the body, and getting the name wrong fails at the first call rather
// than at link time.

// shim renders one method as a JNI function. overloaded says whether another
// native on the same Java class shares this one's name, which is what decides
// the mangled form.
func shim(b Binding, pkg string, c *ir.Class, m *ir.Method, overloaded bool) string {
	// Every native is static and takes the object it acts on as an address. The
	// alternative -- an instance native reading a field off the jobject -- costs a
	// field lookup on every call to learn what the caller already knows.
	//
	// A value struct is the exception, because there is no address to take: the
	// object the caller holds is the value, so it is passed and read back.
	params := []string{"JNIEnv* env", "jclass"}
	var before []string
	self := b.values[c.CppName] != nil && m.MethodKind != ir.Constructor
	if !m.Static && m.MethodKind != ir.Constructor {
		if self {
			params = append(params, "jobject self")
			before = append(before, fmt.Sprintf("%s obj = %s(env, self);", c.Spelling(), b.readerName(c)))
		} else {
			params = append(params, "jlong nativeObject")
		}
	}

	var after, args []string
	for i, p := range m.Params {
		a := marshal(b, p, i)
		params = append(params, a.decl)
		args = append(args, a.expr)
		before = append(before, a.before...)
		after = append(after, a.after...)
	}

	call := nativeCall(c, m, self) + "(" + strings.Join(args, ", ") + ")"

	// A math value has no jvalue to be: it is several numbers. The caller passes an
	// array to be filled, and the native returns nothing, which is also the only
	// shape that works for a matrix the JVM has no type for.
	returns := b.jniType(m.Return)
	if m.MethodKind == ir.Constructor {
		returns = "jlong"
	}
	if m.Return.IsMath() && m.MethodKind != ir.Constructor {
		out := mathElement(m.Return)
		params = append(params, out.jni+"Array out_")
		before = append(before, fmt.Sprintf("%s* out = env->Get%sArrayElements(out_, nullptr);", out.jni, out.array))
		after = append(after, fmt.Sprintf("env->Release%sArrayElements(out_, out, 0);", out.array))
		before = append(before, fmt.Sprintf("*reinterpret_cast<%s*>(out) = %s;", m.Return.Canonical, call))
		call, returns = "", "void"
	}

	body := before
	switch {
	case call == "":
		// Already spent, filling the out-parameter above.
	case m.Return.Kind == ir.KindVoid && m.MethodKind != ir.Constructor:
		body = append(body, call+";")
	case len(after) > 0:
		// Name the result before the releases run: a release frees the memory an
		// argument was read out of, and the result may point into it.
		result := local("result", m)
		body = append(body, fmt.Sprintf("%s %s = %s;", returns, result, b.returnExpr(call, m)))
		after = append(after, "return "+result+";")
	default:
		body = append(body, "return "+b.returnExpr(call, m)+";")
	}
	body = append(body, after...)

	var out strings.Builder
	fmt.Fprintf(&out, "extern \"C\" JNIEXPORT %s JNICALL\n%s(%s) {\n",
		returns, symbol(b, pkg, c, m, overloaded), strings.Join(params, ", "))
	for _, line := range body {
		fmt.Fprintf(&out, "    %s\n", line)
	}
	out.WriteString("}\n")
	return out.String()
}

// local is a name for something the shim needs that nothing else has taken --
// neither a parameter nor the locals the marshalling introduces beside them.
// Filament has a parameter called result.
func local(name string, m *ir.Method) string {
	taken := map[string]bool{}
	for i, p := range m.Params {
		arg := paramName(p, i)
		taken[arg] = true
		taken[arg+"_"] = true
	}
	for taken[name] {
		name += "_"
	}
	return name
}

// paramName is what the shim calls a parameter. C++ lets one go unnamed.
func paramName(p *ir.Param, index int) string {
	if p.Name == "" {
		return fmt.Sprintf("arg%d", index)
	}
	return p.Name
}

// nativeCall is the callee: a static method through its qualified name, an
// instance method through the address the caller passed.
// jniType is jniType with the value structs added: those cross as the Java
// object holding the members, which is a jobject like any other.
func (b Binding) jniType(t *ir.Type) string {
	if b.IsValue(t) {
		return "jobject"
	}
	return jniType(t)
}

func nativeCall(c *ir.Class, m *ir.Method, self bool) string {
	switch {
	case m.MethodKind == ir.Constructor:
		// The one native that makes something rather than calling it. What comes
		// back is the address, which is what the Java object will hold.
		return "new " + c.Spelling()
	case m.Static:
		return m.Spelling()
	case self:
		// The copy read out of the Java object. Anything the method writes to it is
		// lost, which is what a value passed by copy means everywhere else too.
		return "obj." + m.CallName()
	}
	return fmt.Sprintf("((%s*) nativeObject)->%s", c.Spelling(), m.CallName())
}

// argument is one parameter: how it is declared, the expression handed to the
// native call, and whatever has to happen either side of it.
type argument struct {
	decl   string
	expr   string
	before []string
	after  []string
}

func marshal(b Binding, p *ir.Param, index int) argument {
	name := paramName(p, index)
	a := argument{decl: b.jniType(p.Type) + " " + name, expr: name}

	switch {
	case b.IsValue(p.Type):
		a.expr = fmt.Sprintf("%s(env, %s)", b.readerName(b.Class(p.Type)), name)

	case isSmuggled(p.Type):
		s, _ := smuggles(p.Type)
		a.expr = s.in(name)

	case p.Type.Kind == ir.KindEnum:
		a.expr = fmt.Sprintf("(%s) %s", p.Type.Canonical, name)

	case p.Type.Kind == ir.KindString:
		// The JVM's copy is valid only until it is released, and the native call is
		// the only thing that reads it, so it is released straight after.
		a.before = []string{fmt.Sprintf("const char* %s_ = env->GetStringUTFChars(%s, nullptr);", name, name)}
		a.after = []string{fmt.Sprintf("env->ReleaseStringUTFChars(%s, %s_);", name, name)}
		a.expr = name + "_"

	case isArray(p.Type):
		// The array the caller passed is the array the native call reads. Its length
		// is the caller's, exactly as it is in C++: a count or a stride beside it in
		// the signature is a separate argument and is passed as one.
		elem := mathElement(p.Type)
		a.before = []string{fmt.Sprintf("%s* %s_ = env->Get%sArrayElements(%s, nullptr);", elem.jni, name, elem.array, name)}
		// A const pointer is only read, so there is nothing to write back; anything
		// else is an out-parameter and the copy has to go the other way too.
		mode := "0"
		if p.Type.Const {
			mode = "JNI_ABORT"
		}
		a.after = []string{fmt.Sprintf("env->Release%sArrayElements(%s, %s_, %s);", elem.array, name, name, mode)}
		a.expr = fmt.Sprintf("reinterpret_cast<%s*>(%s_)", elementType(p.Type), name)

	case p.Type.IsMath():
		elem := mathElement(p.Type)
		a.before = []string{fmt.Sprintf("%s* %s_ = env->Get%sArrayElements(%s, nullptr);", elem.jni, name, elem.array, name)}
		// JNI_ABORT: the native call took a copy, so there is nothing to write back.
		a.after = []string{fmt.Sprintf("env->Release%sArrayElements(%s, %s_, JNI_ABORT);", elem.array, name, name)}
		a.expr = fmt.Sprintf("*reinterpret_cast<%s*>(%s_)", p.Type.Canonical, name)

	case isHandle(p.Type):
		a.expr = handleExpr(name, p.Type)
	}
	return a
}

// elementType is the C++ type the array is reinterpreted as: what the pointer
// pointed at, with the const the parameter was declared with.
func elementType(t *ir.Type) string {
	name := t.Canonical
	if name == "" {
		name = t.Cpp
	}
	if t.Const {
		return "const " + name
	}
	return name
}

// returnExpr is what the shim hands back.
func (b Binding) returnExpr(call string, m *ir.Method) string {
	if m.MethodKind == ir.Constructor {
		// What comes back is the address of the new object, which is what the Java
		// side will hold on to.
		return "(jlong) " + call
	}
	return b.jvalue(call, m.Return)
}

// jvalue turns the result of a call into something the JVM has a type for.
func (b Binding) jvalue(call string, t *ir.Type) string {
	switch {
	case b.IsValue(t):
		return fmt.Sprintf("%s(env, %s)", b.writerName(b.Class(t)), call)

	case isSmuggled(t):
		s, _ := smuggles(t)
		return fmt.Sprintf("(%s) %s", jniType(t), s.out(call))

	case t.Kind == ir.KindString:
		// NewStringUTF copies, which is what makes it safe to hand it a pointer into
		// something the native side is about to free.
		return fmt.Sprintf("env->NewStringUTF(%s)", cString(call, t))
	case isHandle(t):
		if t.Indirection == ir.Reference {
			return fmt.Sprintf("(jlong) &%s", call)
		}
		return fmt.Sprintf("(jlong) %s", call)
	}
	return fmt.Sprintf("(%s) %s", jniType(t), call)
}

// cString is what NewStringUTF needs: a pointer to a null-terminated string.
// Only a const char* already is one. A std::string has to be asked for it, and a
// string_view is not null-terminated at all, so it has to be copied first.
func cString(expr string, t *ir.Type) string {
	switch {
	case strings.Contains(t.Canonical, "string_view"):
		return fmt.Sprintf("std::string(%s).c_str()", expr)
	case strings.Contains(t.Canonical, "string"):
		return fmt.Sprintf("(%s).c_str()", expr)
	}
	return expr
}

// isHandle reports a type that crosses as the address of a native object.
func isHandle(t *ir.Type) bool {
	return (t.Kind == ir.KindClass || t.Kind == ir.KindStruct) && t.Indirection != ir.Direct
}

func handleExpr(name string, t *ir.Type) string {
	cpp := t.Canonical
	if cpp == "" {
		cpp = t.Target
	}
	if t.Indirection == ir.Reference {
		return fmt.Sprintf("*(%s*) %s", cpp, name)
	}
	return fmt.Sprintf("(%s*) %s", cpp, name)
}
