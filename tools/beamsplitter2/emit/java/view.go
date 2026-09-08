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

package java

import (
	"embed"
	"fmt"
	"strings"
	"text/template"

	"beamsplitter2/emit/jni"
	"beamsplitter2/ir"
	"strconv"
)

// This file is the boundary between the IR and the generated Java: the structs a
// template may read, and nothing else. Every field is already the exact text
// that will appear in the source.

//go:embed templates/*.template
var templates embed.FS

var parsed = template.Must(template.ParseFS(templates, "templates/*.template"))

type classFile struct {
	Package string
	Class   class
}

type class struct {
	Name   string
	Static bool // a nested class is declared static; a top-level one cannot be
	// Value classes hold the members themselves. Everything else holds the address
	// of a native object, which is what its natives are called with.
	Value   bool
	Fields  []string
	Methods []method
	Nested  []class
}

// method is one binding: the native the shim defines, and the method a caller
// actually writes.
type method struct {
	Native  string // the whole "private static native ..." line
	Wrapper []string
}

func render(v classFile) string {
	var b strings.Builder
	if err := parsed.ExecuteTemplate(&b, "class", v); err != nil {
		panic(err) // the templates are compiled in; a failure here is a bug, not input
	}
	return b.String()
}

// classView builds one top-level class and everything nested inside it.
func classView(b jni.Binding, api *ir.API, module Module, c *ir.Class, all []*ir.Class) classFile {
	return classFile{Package: module.Package, Class: build(b, api, module, c, all, false)}
}

func build(b jni.Binding, api *ir.API, module Module, c *ir.Class, all []*ir.Class, nested bool) class {
	// Only the outermost class carries the suffix: it is the file name that forces
	// it, and a nested class has no file of its own.
	name := c.Name
	if !nested {
		name = b.JavaClass(c)
	}
	out := class{Name: name, Static: nested, Value: b.IsValue(&ir.Type{Kind: ir.KindStruct, Target: c.CppName})}
	if out.Value {
		// The constants first: a member's default is often written in terms of one,
		// and Java reads a class in order.
		for _, f := range c.Fields {
			if f.Static && f.Access == "public" {
				if v := javaValue(api, f); v != "" {
					out.Fields = append(out.Fields, fmt.Sprintf("public static final %s %s = %s;",
						b.JavaType(f.Type, module.Package), f.Name, v))
				}
			}
		}
		for _, f := range b.Members(c) {
			out.Fields = append(out.Fields, fieldView(b, api, module, f))
		}
	}
	// A value class is copied, never allocated, so it has neither.
	if !out.Value {
		for _, m := range c.Constructors {
			if m.Bind {
				out.Methods = append(out.Methods, constructorView(b, module, c, m))
			}
		}
		if b.Owns(c) {
			out.Methods = append(out.Methods, destructorView(b, module, c))
		}
	}
	for _, m := range c.Methods {
		if m.Bind {
			out.Methods = append(out.Methods, methodView(b, module, c, m, out.Value))
		}
	}
	for _, other := range all {
		if other.Enclosing != "" && strings.TrimSuffix(other.CppName, "::"+other.Name) == c.CppName {
			out.Nested = append(out.Nested, build(b, api, module, other, all, true))
		}
	}
	return out
}

// fieldView is one member of a value class, with what the header says it starts
// as. A caller who builds one of these and sets two fields gets Filament's
// defaults for the rest, which is the whole point of copying them across.
func fieldView(b jni.Binding, api *ir.API, module Module, f *ir.Field) string {
	java := b.JavaType(f.Type, module.Package)
	decl := fmt.Sprintf("public %s %s", java, f.Name)
	switch {
	case strings.HasSuffix(java, "[]"):
		// The shim reads the members out of whatever the field holds, so a member
		// that is an object is never allowed to be null. An array is also the one
		// place its length is written down on the Java side.
		decl += fmt.Sprintf(" = new %s[%d]", strings.TrimSuffix(java, "[]"), elements(f.Type))
	case b.IsValue(f.Type):
		decl += " = new " + java + "()"
	default:
		if v := javaValue(api, f); v != "" {
			decl += " = " + v
		}
	}
	return decl + ";"
}

// javaValue is a default written the way Java spells it, or "" where there is
// nothing to write: an aggregate that the parser could only note the presence
// of, or a null, which is what a Java field starts as anyway.
func javaValue(api *ir.API, f *ir.Field) string {
	v := f.Default
	if v == "" || v == "default" || v == "nullptr" {
		return ""
	}
	switch f.Type.Kind {
	case ir.KindEnum:
		// The Java side carries the ordinal, so the constant has to be resolved to
		// the value C++ gave it, which is not its position in the list.
		e := api.Enum(f.Type.Target)
		if e == nil {
			return ""
		}
		for _, value := range e.Values {
			if value.Name == v {
				return strconv.FormatInt(value.Value, 10)
			}
		}
		return ""
	case ir.KindF32:
		return v + "f"
	case ir.KindF64, ir.KindBool:
		return v
	}
	return javaNumber(v, f.Type.Kind)
}

// javaNumber writes an integer the way Java will accept it.
//
// Java has no unsigned types, so a member declared uint8_t is a byte here and a
// value like 255 does not fit in one. It is the same bits either way -- the
// narrowing cast is what says so -- but Java insists on being told.
func javaNumber(v string, kind ir.Kind) string {
	n, err := strconv.ParseInt(v, 0, 64)
	if err != nil {
		u, uerr := strconv.ParseUint(v, 0, 64)
		if uerr != nil {
			return ""
		}
		n = int64(u)
	}
	switch kind {
	case ir.KindI8, ir.KindU8:
		return fmt.Sprintf("(byte) %d", int8(n))
	case ir.KindI16, ir.KindU16:
		return fmt.Sprintf("(short) %d", int16(n))
	case ir.KindI32, ir.KindU32:
		return strconv.FormatInt(int64(int32(n)), 10)
	case ir.KindI64, ir.KindU64:
		return strconv.FormatInt(n, 10) + "L"
	}
	return ""
}

// constructorView is the factory that makes one of these. A Java constructor
// cannot be native, and the class already has one taking the address, so what a
// caller gets is a static create.
func constructorView(b jni.Binding, module Module, c *ir.Class, m *ir.Method) method {
	java := b.JavaClassName(c, module.Package)

	var params, args []string
	for i, p := range m.Params {
		arg := paramName(p, i)
		params = append(params, b.JavaType(p.Type, module.Package)+" "+arg)
		args = append(args, arg)
	}
	call := fmt.Sprintf("%s(%s)", jni.JavaName(m), strings.Join(args, ", "))

	return method{
		Native: fmt.Sprintf("private static native long %s(%s);", jni.JavaName(m), strings.Join(params, ", ")),
		Wrapper: []string{
			fmt.Sprintf("public static %s create(%s) {", java, strings.Join(params, ", ")),
			fmt.Sprintf("    return new %s(%s);", java, call),
			"}",
		},
	}
}

// destructorView is the other half of that: what created has to be destroyed,
// and only the caller knows when.
func destructorView(b jni.Binding, module Module, c *ir.Class) method {
	return method{
		Native: "private static native void nDestroy(long nativeObject);",
		Wrapper: []string{
			"public void destroy() {",
			"    nDestroy(mNativeObject);",
			"}",
		},
	}
}

// methodView writes both halves of one binding. They are built together from the
// same types, since a declaration that disagrees with its shim links and then
// throws at the first call.
func methodView(b jni.Binding, module Module, c *ir.Class, m *ir.Method, value bool) method {
	name := jni.JavaName(m)

	// The native's parameters: the object it acts on, the arguments, and for a
	// value the JVM has no type for, the array it is written into.
	var nativeParams, callArgs, wrapperParams []string
	if !m.Static {
		if value {
			// There is no address to pass: the object the caller holds is the value.
			nativeParams = append(nativeParams, b.JavaClass(c)+" self")
			callArgs = append(callArgs, "this")
		} else {
			nativeParams = append(nativeParams, "long nativeObject")
			callArgs = append(callArgs, "mNativeObject")
		}
	}
	for i, p := range m.Params {
		arg := paramName(p, i)
		nativeParams = append(nativeParams, b.JavaType(p.Type, module.Package)+" "+arg)
		wrapperParams = append(wrapperParams, b.JavaType(p.Type, module.Package)+" "+arg)
		callArgs = append(callArgs, arg)
	}

	returns := b.JavaType(m.Return, module.Package)
	nativeReturns := returns
	if m.Return.IsMath() {
		nativeParams = append(nativeParams, returns+" out")
		nativeReturns = "void"
	}

	native := fmt.Sprintf("private static native %s %s(%s);",
		nativeReturns, name, strings.Join(nativeParams, ", "))

	static := ""
	if m.Static {
		static = "static "
	}
	head := fmt.Sprintf("public %s%s %s(%s) {", static, returns, methodName(m), strings.Join(wrapperParams, ", "))

	var body []string
	switch {
	case m.Return.IsMath():
		// The caller gets a fresh array every time: handing back one the native side
		// filled in place would be an array whose contents change under them.
		body = append(body,
			fmt.Sprintf("%s out = new %s[%d];", returns, strings.TrimSuffix(returns, "[]"), elements(m.Return)),
			fmt.Sprintf("%s(%s);", name, strings.Join(append(callArgs, "out"), ", ")),
			"return out;")
	case m.Return.Kind == ir.KindVoid:
		body = append(body, fmt.Sprintf("%s(%s);", name, strings.Join(callArgs, ", ")))
	default:
		body = append(body, fmt.Sprintf("return %s(%s);", name, strings.Join(callArgs, ", ")))
	}

	wrapper := append([]string{head}, indent(body)...)
	return method{Native: native, Wrapper: append(wrapper, "}")}
}

// reserved are the words Java will not let a method be called. Filament has two
// -- Entity::import and Texture::import -- and a generator that does not know
// this produces a file that does not parse.
//
// The native is unaffected: nImport is not a keyword, so only the method a
// caller writes has to move, and it moves the way every Java generator moves it.
var reserved = map[string]bool{
	"abstract": true, "assert": true, "boolean": true, "break": true, "byte": true,
	"case": true, "catch": true, "char": true, "class": true, "const": true,
	"continue": true, "default": true, "do": true, "double": true, "else": true,
	"enum": true, "extends": true, "final": true, "finally": true, "float": true,
	"for": true, "goto": true, "if": true, "implements": true, "import": true,
	"instanceof": true, "int": true, "interface": true, "long": true, "native": true,
	"new": true, "package": true, "private": true, "protected": true, "public": true,
	"return": true, "short": true, "static": true, "strictfp": true, "super": true,
	"switch": true, "synchronized": true, "this": true, "throw": true, "throws": true,
	"transient": true, "try": true, "void": true, "volatile": true, "while": true,
	"true": true, "false": true, "null": true, "_": true,
}

func methodName(m *ir.Method) string {
	if name := m.BoundAs(); !reserved[name] {
		return name
	}
	return m.BoundAs() + "_"
}

// elements is how many numbers a math value is, which is the length of the array
// it crosses in.
func elements(t *ir.Type) int {
	if t.Cols > 0 {
		return t.Rows * t.Cols
	}
	if t.Rows > 0 {
		return t.Rows
	}
	return 4 // a quaternion, whose rank the IR records as its four components
}

// paramName is what the argument is called. C++ lets a parameter go unnamed;
// Java does not.
func paramName(p *ir.Param, index int) string {
	if p.Name == "" {
		return fmt.Sprintf("arg%d", index)
	}
	return p.Name
}

func indent(lines []string) []string {
	out := make([]string, 0, len(lines))
	for _, line := range lines {
		out = append(out, "    "+line)
	}
	return out
}
