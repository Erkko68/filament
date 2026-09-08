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
	"unicode"

	"beamsplitter2/ir"
)

// What things are called on either side of the boundary.
//
// The JVM finds a native by the name of its symbol, so these are the whole of
// the binding as far as linking is concerned: a name built here that disagrees
// with what javac writes down compiles, links, and throws at the first call.
// verify-java.sh is what says they agree.

// symbol is the name the JVM will look for.
//
// Only an overloaded native carries the argument signature, which is the
// specification's rule and not a convention: adding the suffix to a native that
// is not overloaded makes it unfindable, and leaving it off one that is makes it
// ambiguous.
//
// What counts as overloaded is the Java class, not the C++ one. The IR's
// Overloaded says the C++ name is carried by more than one declaration, which is
// what embind needs in order to cast to the right member pointer; here the
// question is how many natives the generated Java actually declares under this
// name, and a rejected overload declares none.
func symbol(b Binding, pkg string, c *ir.Class, m *ir.Method, overloaded bool) string {
	name := "Java_" + mangle(pkg+"."+b.JavaClass(c)) + "_" + mangle(JavaName(m))
	if overloaded {
		name += "__" + mangle(b.descriptors(c, m))
	}
	return name
}

// Overloads reports, for one class, which native names more than one bound
// method will be declared under. Both halves of the binding ask this: the shim
// to build its symbol, and nothing on the Java side, because javac applies the
// same rule to what it finds in the source.
func (b Binding) Overloads(c *ir.Class) map[string]int {
	counts := map[string]int{}
	for _, m := range c.AllMethods() {
		if m.Bind {
			counts[JavaName(m)]++
		}
	}
	if b.Owns(c) {
		// The destructor is not a method of the class, but it is a native of the
		// Java one, and Filament has a NameComponentManager::destroy of its own.
		counts["nDestroy"]++
	}
	return counts
}

// descriptors is the JVM signature of the native's parameters, which includes the
// address a non-static one takes: the Java declaration has that parameter too.
func (b Binding) descriptors(c *ir.Class, m *ir.Method) string {
	var sb strings.Builder
	if !m.Static && m.MethodKind != ir.Constructor {
		// Whatever the native takes the object as: an address, or the value itself.
		if v := b.values[c.CppName]; v != nil {
			sb.WriteString("L" + strings.ReplaceAll(b.packages[c.CppName], ".", "/") + "/" + b.JavaClass(c) + ";")
		} else {
			sb.WriteString("J")
		}
	}
	for _, p := range m.Params {
		sb.WriteString(b.Descriptor(p.Type))
	}
	if m.Return.IsMath() {
		sb.WriteString("[" + mathElement(m.Return).descriptor)
	}
	return sb.String()
}

// JavaName is what the native is called on the Java side.
//
// The prefix is not decoration: the natives sit in the same class as the methods
// that call them, so nSetProjection is what lets setProjection exist at all.
func JavaName(m *ir.Method) string {
	if m.MethodKind == ir.Constructor {
		// A Java constructor cannot be native, so the natives that make an object are
		// all called the same thing and told apart the way any other overload is.
		return "nCreate"
	}
	name := m.BoundAs()
	if name == "" {
		return "n"
	}
	return "n" + strings.ToUpper(name[:1]) + name[1:]
}

// javaClass is the short name: the namespaces dropped, the nesting kept. It can
// collide, which is what Binding.JavaClass resolves.
//
// Old comment: the binary name of the class the natives belong to, relative to
// its package: the namespaces are what the package already says, and what is
// left is the class and whatever it is nested in, which the JVM spells with a
// dollar.
//
// It must agree with the Java side exactly, since a symbol built from a
// different spelling is one the JVM will never look for.
func javaClass(c *ir.Class) string {
	name := strings.TrimPrefix(c.CppName, "filament::")
	for _, ns := range []string{"backend::", "utils::", "math::", "gltfio::", "viewer::", "image::", "filamat::", "camutils::", "geometry::", "filamesh::", "ktxreader::", "color::"} {
		name = strings.TrimPrefix(name, ns)
	}
	// Only the outermost class is marked: it is the one with a file, and a nested
	// class has no name of its own to collide with anything.
	parts := strings.Split(name, "::")
	parts[0] = GeneratedName(parts[0])
	return strings.Join(parts, "$")
}

// GeneratedName marks a class as generated, the same way the shims mark their
// file. It is on the class and not only on the file because Java ties the two
// together: a public class has to live in a file named after it. It is also what
// lets a hand-written class of the original name extend this one rather than
// collide with it.
//
// Both halves call this. A symbol built from one spelling and a class declared
// with another is a binding that links and then throws.
func GeneratedName(class string) string {
	return class + "_generated"
}

// mangle applies the JNI specification's name mangling. Everything but a letter
// or a digit has to be escaped, because the symbol is a C identifier and the
// escapes are what keep two different Java names from colliding in it.
func mangle(s string) string {
	var b strings.Builder
	for _, r := range s {
		switch {
		case r == '.' || r == '/':
			b.WriteByte('_')
		case r == '_':
			b.WriteString("_1")
		case r == ';':
			b.WriteString("_2")
		case r == '[':
			b.WriteString("_3")
		case r < unicode.MaxASCII && (unicode.IsLetter(r) || unicode.IsDigit(r)):
			b.WriteRune(r)
		default:
			fmt.Fprintf(&b, "_0%04x", r)
		}
	}
	return b.String()
}
