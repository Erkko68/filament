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

// Package jni emits JNI bindings from the IR.
//
// Nothing here is derived from the JNI Filament already ships. The names come
// from the JNI specification's own mangling and the marshaling from what the
// specification says a jvalue is, so that a Java side written against it agrees
// by construction rather than by resemblance.
package jni

import (
	"strings"

	"beamsplitter2/ir"
)

// Target answers what a JNI call can carry. Like the embind target it is asked
// about types and never about methods, so a method added to a header is
// classified without touching this file.
//
// It is built from the parsed API because one answer depends on more than the
// type in hand: whether a struct can cross by copy depends on what it is made
// of. That is still a question about types alone, and it is answered once, up
// front, rather than inside the fixed point.
type Target struct {
	values values
}

// NewTarget reads the API for the structs that can cross as values.
func NewTarget(api *ir.API) Target {
	return Target{values: valueStructs(api)}
}

// Values is what the emitter needs back: the structs this target decided to
// carry by copy, which are the ones the Java side declares fields for.
func (t Target) Values() values { return t.values }

// Marshal reports whether a value of this type can cross into Java.
//
// The two boundaries differ in what they find hard, which is the reason the
// question belongs to the target rather than to the rules: JNI has jlong, so a
// 64-bit integer is free where embind needs a build flag, and JNI has no value
// objects, so a struct passed by copy is work where embind gets it for nothing.
func (t Target) Marshal(ty *ir.Type) (rule, reason string) {
	switch {
	case ty.Indirection == ir.RValueRef:
		return "rvalue-ref-param", "takes " + ty.Cpp + ", and Java has no way to move a value"

	case ty.Kind == ir.KindCallback:
		return "callback", ty.Cpp + " needs a hand-written bridge to a Java object"

	case ty.Kind == ir.KindBuffer:
		// A descriptor owns its memory and frees it through a callback. Handing that
		// to the JVM is a lifetime question, not a conversion.
		return "buffer", ty.Cpp + " owns memory whose lifetime Java cannot be told about"

	case ty.Kind == ir.KindVoid && ty.Indirection == ir.Pointer:
		return "opaque-pointer", ty.Cpp + " is opaque, so there is nothing to marshal"

	case isArray(ty):
		// A pointer to a number is an array, and the array the caller passes is
		// where its length comes from -- the same place the C++ caller gets it. A
		// count or a stride beside it in the signature stays a parameter of its own,
		// because that is what it is: pairing them off would read a stride as a
		// length, which is thirteen of the ones this used to refuse.
		return "", ""

	case ty.Indirection == ir.Pointer && !pointerIsHandle(ty):
		// A pointer to anything else: a struct, a pointer to a pointer. There is no
		// array of it for the JVM to hand over.
		return "unsized-array", string(ty.Kind) + " array with no element type"

	case isSmuggled(ty):
		// A number wearing a class. See smuggle.go.
		return "", ""

	case t.values.isValue(ty):
		// A value that crosses as a Java object holding the members. See value.go.
		return "", ""

	case (ty.Kind == ir.KindStruct || ty.Kind == ir.KindClass) && ty.Indirection == ir.Direct:
		// Java has no value type. Copying one across means a Java class with a field
		// for each member and a conversion either side, which is a binding to write
		// rather than a shim to generate.
		return "value-object", ty.Cpp + " crosses by copy, and Java has no value type"
	}
	return "", ""
}

func isSmuggled(t *ir.Type) bool {
	_, ok := smuggles(t)
	return ok
}

// isArray reports a pointer the JVM has an array type for: a pointer to a
// number, or to one of the math values, which is several numbers in a row.
//
// It asks the same question the type table does, because the shim declares the
// parameter from one and marshals it from the other. Filament has a quaternion
// of half floats, which the JVM has no array of, and the two answers disagreeing
// about it is a shim that does not compile.
func isArray(t *ir.Type) bool {
	if t.Indirection != ir.Pointer {
		return false
	}
	_, ok := element(t)
	return ok
}

// pointerIsHandle reports a pointer that crosses as the address of an object
// rather than as the first element of an array.
func pointerIsHandle(ty *ir.Type) bool {
	switch ty.Kind {
	case ir.KindClass, ir.KindStruct, ir.KindVoid, ir.KindString:
		return true
	}
	return false
}

// OverloadKey is the full argument signature, because that is what the JVM
// dispatches on: two natives differing in any argument type are two methods, and
// the mangled name carries the difference. Only two methods identical to the JVM
// collide, which after the const twins have been dropped means none.
func (Target) OverloadKey(m *ir.Method) string {
	types := make([]string, 0, len(m.Params))
	for _, p := range m.Params {
		types = append(types, javaDescriptor(p.Type))
	}
	return m.BoundAs() + "(" + strings.Join(types, "") + ")"
}
