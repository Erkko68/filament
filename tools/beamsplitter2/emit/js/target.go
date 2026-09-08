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

	"beamsplitter2/ir"
)

// Target is what embind can carry, and nothing else. Every refusal below is a
// limit of embind or of the wasm build; none of them is a fact about Filament, and
// none of them names a method or a class.
//
// This is deliberately a question about *types*. There are a few dozen of those
// and they change rarely, whereas methods are added to headers constantly; asking
// per type is what lets a new method be classified without touching the tool.
type Target struct {
	// BigInt reports a build with -sWASM_BIGINT, which lets a 64-bit integer cross
	// the boundary as a JavaScript BigInt. Off by default, matching the build.
	BigInt bool
}

// Marshal reports whether embind can carry a value of this type.
func (t Target) Marshal(ty *ir.Type) (rule, reason string) {
	switch {
	case ty.Indirection == ir.RValueRef && ty.Kind != ir.KindBuffer:
		// A buffer is moved by design and the binding adapts it, so it is allowed
		// to arrive by rvalue reference.
		return "rvalue-ref-param", "takes " + ty.Cpp + ", and JavaScript has no way to move a value"

	case ty.Kind == ir.KindCallback:
		return "callback", ty.Cpp + " needs a hand-written bridge to a JavaScript function"

	case ty.Kind == ir.KindArray:
		// A value object copies member by member, and there is no member for the
		// elements of a C array to be.
		return "c-array", ty.Cpp + " is a C array, which embind has no member for"

	case ty.Kind == ir.KindVoid && ty.Indirection == ir.Pointer:
		return "opaque-pointer", ty.Cpp + " is opaque, so there is nothing to marshal"

	case isArray(ty):
		// A pointer to a number is an array, and the array JavaScript passes is
		// where its length comes from -- the same place the C++ caller gets it. A
		// count or a stride beside it in the signature stays a parameter of its own.
		return "", ""

	case ty.Indirection == ir.Pointer && !pointerIsHandle(ty):
		// A pointer to anything else: a struct, a pointer to a pointer. There is no
		// array of it JavaScript could hand over.
		return "unsized-array", fmt.Sprintf("%s array with no element type", ty.Kind)

	case !t.BigInt && strings.Contains(ty.Canonical, "long long"):
		// embind cannot carry a 64-bit integer unless the build enables WASM BigInt.
		// On wasm32 that means "long long", not "long", which is where size_t lands.
		return "sixty-four-bit", "64-bit integer, which needs -sWASM_BIGINT"
	}
	return "", ""
}

// isArray reports a pointer JavaScript has an array of: a pointer to a number,
// or to one of the math values, which is several numbers in a row.
func isArray(ty *ir.Type) bool {
	if ty.Indirection != ir.Pointer {
		return false
	}
	return arrayElement(ty) != ""
}

// pointerIsHandle reports a pointer embind passes as a reference to an object
// rather than as the first element of an array.
func pointerIsHandle(ty *ir.Type) bool {
	switch ty.Kind {
	case ir.KindClass, ir.KindVoid, ir.KindString, ir.KindBuffer, ir.KindCallback:
		return true
	}
	return false
}

// OverloadKey is the name and argument count, because that is all embind
// dispatches on: two bound methods with the same name and arity are one
// JavaScript function no matter how different their C++ types are, so registering
// both is not a worse binding but a broken one.
func (Target) OverloadKey(m *ir.Method) string {
	return fmt.Sprintf("%s/%d", m.BoundAs(), len(m.Params))
}
