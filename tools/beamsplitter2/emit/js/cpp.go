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

package js

import (
	"fmt"
	"strings"

	"beamsplitter2/emit"
	"beamsplitter2/ir"
)

// This file maps IR types onto the C++ spellings the generated bindings use.
//
// Two spellings are needed for each type and they are not the same. The native
// spelling is what Filament declares; the bridge spelling is what crosses into
// JavaScript, which differs wherever JavaScript cannot represent the native form:
// a matrix arrives as the flat 16-float `flatmat4` from jsbindings_helpers.h, a
// string as std::string, an array as an emscripten::val.

// scalarCpp is the C++ spelling of each primitive kind. The IR stores canonical
// spellings ("unsigned int"), but the fixed-width names read better in generated
// code and are what the headers themselves use.
var scalarCpp = map[ir.Kind]string{
	ir.KindBool: "bool",
	ir.KindI8:   "int8_t",
	ir.KindI16:  "int16_t",
	ir.KindI32:  "int32_t",
	ir.KindI64:  "int64_t",
	ir.KindU8:   "uint8_t",
	ir.KindU16:  "uint16_t",
	ir.KindU32:  "uint32_t",
	ir.KindU64:  "size_t",
	ir.KindF32:  "float",
	ir.KindF64:  "double",
}

// nativeType is the type as Filament declares it, fully qualified so it is valid
// anywhere in the generated file regardless of the surrounding namespace.
func nativeType(t *ir.Type) string {
	base := ""
	switch {
	case t.Kind == ir.KindVoid && t.Indirection == ir.Pointer:
		base = "void"
	case t.Kind == ir.KindVoid:
		return "void"
	case t.Canonical != "":
		// Whatever clang recorded, verbatim. select_overload matches on the exact
		// type, and on wasm32 uint64_t, size_t and unsigned long are three different
		// types, just as std::string_view is not std::string.
		base = t.Canonical
	case scalarCpp[t.Kind] != "":
		base = scalarCpp[t.Kind]
	default:
		base = t.Cpp
	}
	return decorate(base, t)
}

// arrayElement is the number an array parameter is an array of, "" if the type
// is not one. A math value is several of its scalar; a pointer to a number is
// several of that number.
func arrayElement(t *ir.Type) string {
	if t.Kind == ir.KindBool {
		// std::vector<bool> is a bitset with no data() to take the address of, so a
		// copy of one is made of the bytes a bool is instead.
		return "char"
	}
	if t.IsMath() {
		return scalarCpp[t.Scalar]
	}
	return scalarCpp[t.Kind]
}

// bridgeType is the type as it crosses into JavaScript.
func bridgeType(t *ir.Type) string {
	if isArray(t) {
		// Whatever JavaScript passed: an Array or a typed array, copied on the way in
		// and, where the callee writes to it, on the way back out.
		return "emscripten::val"
	}
	switch t.Kind {
	case ir.KindMatrix:
		return flatMatrix(t)
	case ir.KindString:
		return "std::string"
	case ir.KindBuffer:
		return bufferWrapper(t)
	}
	if relabelled(t) {
		return decorate(scalarCpp[t.Kind], t)
	}
	return nativeType(t)
}

// relabelled reports a type the rules gave a scalar kind that C++ still spells as
// a class: utils::EntityInstance is a uint32_t index wearing a class. A real
// scalar never names a declaration, so Target is what tells the two apart.
//
// Nothing has to convert one: the class has implicit conversions both ways, so
// the scalar in the lambda's signature and the class in the native call meet in
// the middle. What is needed is the lambda itself -- embind cannot take a member
// pointer whose type it has never been shown.
func relabelled(t *ir.Type) bool {
	return t.Target != "" && scalarCpp[t.Kind] != ""
}

// jsbindings_helpers.h defines two buffer wrappers, one per native descriptor,
// each holding its payload under a different member name.
func bufferWrapper(t *ir.Type) string {
	if strings.Contains(t.Canonical, "PixelBufferDescriptor") {
		return "PixelBufferDescriptor"
	}
	return "BufferDescriptor"
}

func bufferField(t *ir.Type) string {
	if strings.Contains(t.Canonical, "PixelBufferDescriptor") {
		return "pbd"
	}
	return "bd"
}

// flatMatrix picks the flat wrapper matching the matrix shape. Getting this from
// the IR rather than assuming 4x4 is what makes mat3f bindable at all.
func flatMatrix(t *ir.Type) string {
	if t.Rows == 3 && t.Cols == 3 {
		return "flatmat3"
	}
	return "flatmat4"
}

func decorate(base string, t *ir.Type) string {
	if t.Const {
		base = "const " + base
	}
	switch t.Indirection {
	case ir.Pointer:
		return base + "*"
	case ir.Reference:
		return base + "&"
	case ir.RValueRef:
		return base + "&&"
	}
	return base
}

// Names is what every declaration is registered under in JavaScript.
//
// It is a map rather than a function because the short name is not always
// available: two declarations whose namespaces differ can lose them and become
// one name, and embind refuses to register a name twice -- at module load, with
// nothing in the generated C++ to show for it.
type Names map[string]string

// NewNames resolves the names for every target at once. One document declares
// them all, so a name has to mean the same thing across the binaries as well as
// within one.
func NewNames(all []*ir.API) Names {
	short := map[string]string{}
	for _, api := range all {
		for _, c := range api.Classes {
			short[c.CppName] = shortName(c.CppName)
		}
		for _, e := range api.Enums {
			short[e.CppName] = shortName(e.CppName)
		}
	}
	return emit.Disambiguate(short, "$")
}

// Of is the name a declaration is bound under.
func (n Names) Of(cppName string) string {
	if name, ok := n[cppName]; ok {
		return name
	}
	return shortName(cppName)
}

// shortName drops the namespaces and joins the nesting with "$", matching the
// existing bindings and the .d.ts. It is what a name is before anything else
// turns out to want it too.
func shortName(cppName string) string {
	name := strings.TrimPrefix(cppName, "filament::")
	for _, ns := range []string{"backend::", "utils::", "math::", "gltfio::"} {
		name = strings.TrimPrefix(name, ns)
	}
	return strings.ReplaceAll(name, "::", "$")
}

// needsBridge reports whether a method can be handed to embind as a plain member
// pointer, or whether its arguments have to be converted by a lambda first.
func needsBridge(m *ir.Method) bool {
	if isMathReturn(m.Return) || m.Return.Kind == ir.KindBuffer || returnsReference(m.Return) {
		return true
	}
	if relabelled(m.Return) {
		return true
	}
	for _, p := range m.Params {
		if p.Type.Kind == ir.KindMatrix || p.Type.Kind == ir.KindBuffer || relabelled(p.Type) || isArray(p.Type) {
			return true
		}
	}
	return false
}

// returnsReference reports a method handing back a reference to an object.
// embind binds a returned reference by value, which needs a copy constructor that
// Filament's engine-owned types do not have, so these are returned as pointers.
func returnsReference(t *ir.Type) bool {
	return t.Indirection == ir.Reference && (t.Kind == ir.KindClass || t.Kind == ir.KindStruct)
}

// isMathReturn reports a returned matrix, which must be flattened for JavaScript.
func isMathReturn(t *ir.Type) bool {
	return t.Kind == ir.KindMatrix
}

// toBridge converts a native value into its JavaScript-facing form.
func toBridge(expr string, t *ir.Type) string {
	switch t.Kind {
	case ir.KindMatrix:
		// flatmat3/flatmat4 hold single-precision matrices, which is what gl-matrix
		// expects on the JavaScript side.
		element := "filament::math::mat4f"
		if t.Rows == 3 && t.Cols == 3 {
			element = "filament::math::mat3f"
		}
		return fmt.Sprintf("%s { %s(%s) }", flatMatrix(t), element, expr)
	}
	return expr
}

// fromBridge converts a JavaScript-facing value back into the native form.
func fromBridge(expr string, t *ir.Type) string {
	switch t.Kind {
	case ir.KindMatrix:
		native := t.Canonical
		if native == "" {
			native = "filament::math::mat4"
		}
		return fmt.Sprintf("%s(%s.m)", native, expr)
	case ir.KindString:
		return expr + ".c_str()"
	case ir.KindBuffer:
		return fmt.Sprintf("std::move(*%s.%s)", expr, bufferField(t))
	}
	return expr
}
