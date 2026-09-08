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

import "beamsplitter2/ir"

// This file maps IR types onto the four spellings one binding needs: the C type
// the shim declares (jint, jfloatArray), the Java type its declaration is
// written with (int, float[]), the JVM descriptor that names it (I, [F), and
// the word in the middle of GetIntArrayElements.
//
// They are one table because they have to agree. The descriptor is what an
// overloaded native's mangled symbol carries, the C type is what the JVM pushes
// arguments as, and the Java type is what decides both -- a Java side written
// from a different column than the shim is a binding that links and then throws
// UnsatisfiedLinkError.
type scalar struct {
	jni        string
	java       string
	descriptor string
	array      string // the infix of Get<array>ArrayElements
}

// Java has no unsigned types. Each one takes the signed type of the same width,
// which keeps every bit and lets the Java side reinterpret if it cares, rather
// than widening and pretending the range is other than it is.
var scalars = map[ir.Kind]scalar{
	ir.KindVoid: {"void", "void", "V", ""},
	ir.KindBool: {"jboolean", "boolean", "Z", "Boolean"},
	ir.KindI8:   {"jbyte", "byte", "B", "Byte"},
	ir.KindU8:   {"jbyte", "byte", "B", "Byte"},
	ir.KindI16:  {"jshort", "short", "S", "Short"},
	ir.KindU16:  {"jshort", "short", "S", "Short"},
	ir.KindI32:  {"jint", "int", "I", "Int"},
	ir.KindU32:  {"jint", "int", "I", "Int"},
	ir.KindI64:  {"jlong", "long", "J", "Long"},
	ir.KindU64:  {"jlong", "long", "J", "Long"},
	ir.KindF32:  {"jfloat", "float", "F", "Float"},
	ir.KindF64:  {"jdouble", "double", "D", "Double"},
}

// jniType is the C type the shim declares for a value of this type.
func jniType(t *ir.Type) string {
	if s, ok := smuggles(t); ok {
		return s.jni
	}
	if isNumbers(t) {
		return mathElement(t).jni + "Array"
	}
	if s, ok := scalars[t.Kind]; ok {
		return s.jni
	}
	switch t.Kind {
	case ir.KindEnum:
		// An enum crosses as its ordinal. Marshalling a Java enum object would mean
		// a class lookup and a field read on every call, for a value that is an int.
		return "jint"
	case ir.KindString:
		return "jstring"
	}
	if isNumbers(t) {
		return mathElement(t).jni + "Array"
	}
	// Everything left is an object, which crosses as the address of the native one.
	return "jlong"
}

// JavaType is the type the Java declaration is written with. It is exported
// because the Java half of these bindings is generated from the same table:
// declaring a native with a type from a different column is how a binding comes
// to link and then throw at the first call.
func JavaType(t *ir.Type) string {
	if s, ok := smuggles(t); ok {
		return s.java
	}
	if isNumbers(t) {
		return mathElement(t).java + "[]"
	}
	if s, ok := scalars[t.Kind]; ok {
		return s.java
	}
	switch t.Kind {
	case ir.KindEnum:
		return "int"
	case ir.KindString:
		return "String"
	}
	if isNumbers(t) {
		return mathElement(t).java + "[]"
	}
	return "long"
}

// javaDescriptor is the JVM's name for the same type.
//
// It is not enough to build a symbol with: a value struct's descriptor has to
// spell the package its Java class is in, which a type alone does not say. That
// is Binding.Descriptor. This one is what OverloadKey compares, where all that
// is asked of it is that two different types come out differently.
func javaDescriptor(t *ir.Type) string {
	if s, ok := smuggles(t); ok {
		return s.descriptor
	}
	if isNumbers(t) {
		return "[" + mathElement(t).descriptor
	}
	if s, ok := scalars[t.Kind]; ok {
		return s.descriptor
	}
	switch t.Kind {
	case ir.KindEnum:
		return "I"
	case ir.KindString:
		return "Ljava/lang/String;"
	}
	if isNumbers(t) {
		return "[" + mathElement(t).descriptor
	}
	return "J"
}

// isNumbers reports a type that crosses as an array of numbers: a math value, a
// fixed C array of them, or a pointer to either. The JVM has no type for any of
// it, and an array of the right element is what they all become.
func isNumbers(t *ir.Type) bool {
	_, ok := element(t)
	return ok
}

// element is what such a type is an array of. A math value is several numbers of
// its scalar; a pointer to a number is several of that number.
func element(t *ir.Type) (scalar, bool) {
	if t.IsMath() || t.Kind == ir.KindArray {
		s, ok := scalars[t.Scalar]
		return s, ok && s.array != ""
	}
	if t.Indirection == ir.Pointer {
		s, ok := scalars[t.Kind]
		return s, ok && s.array != ""
	}
	return scalar{}, false
}

// mathElement is element with a fallback, for the places that have already
// established the type is one of these.
//
// Filament writes these over more than float: there are double matrices and a
// short vector in the public headers, and the array the JVM hands over has to
// match what the native value is read out of.
func mathElement(t *ir.Type) scalar {
	if s, ok := element(t); ok {
		return s
	}
	return scalars[ir.KindF32]
}
