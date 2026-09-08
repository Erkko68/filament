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

	"beamsplitter2/ir"
)

// Some Filament types are a number wearing a class, and say so themselves.
// utils::Entity is the one that matters: it carries a uint32_t identity, and its
// own header offers smuggle and import for the trip, with the comment that the
// int32_t they produce "can be used as is in the Java programing language".
//
// This is not in the shared Filament table, where a type's category lives,
// because it is not a statement about the type. It is a statement about this
// boundary: JavaScript binds Entity as an object with methods on it, and that
// is the right answer there. Both can be true at once, which is why the answer
// belongs to the target.
//
// ponytail: a map, because one entry does not justify a mechanism. If Filament
// grows a family of these, the fix is that they say so in the header rather than
// that this grows a plugin.
type smuggle struct {
	jni        string
	java       string
	descriptor string
	from       string // C++ expression turning the jvalue into the native type
	to         string // and back
	// header declares the conversion. A forward declaration is enough for a header
	// to declare a method returning an Entity; it is not enough to call smuggle on
	// what that method returned.
	header string
}

var smuggled = map[string]smuggle{
	"utils::Entity": {
		jni:        "jint",
		java:       "int",
		descriptor: "I",
		from:       "utils::Entity::import(%s)",
		to:         "utils::Entity::smuggle(%s)",
		header:     "utils/Entity.h",
	},
}

// smuggles reports whether a type crosses as a number, and how. Only a value
// does: a pointer or reference to one is already an address, which is a handle
// like any other, and passing it as an identity would lose the indirection.
func smuggles(t *ir.Type) (smuggle, bool) {
	if t.Indirection != ir.Direct {
		return smuggle{}, false
	}
	s, ok := smuggled[t.Target]
	return s, ok
}

func (s smuggle) in(expr string) string  { return fmt.Sprintf(s.from, expr) }
func (s smuggle) out(expr string) string { return fmt.Sprintf(s.to, expr) }
