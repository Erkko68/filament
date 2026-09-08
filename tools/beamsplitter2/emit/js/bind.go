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

// bindMethod renders one method as an embind registration line.
//
// There are three shapes, in increasing order of cost, and the IR decides which
// one applies without any inspection of C++ text:
//
//	.function("name", &Class::name)                       // types cross as they are
//	.function("name", select_overload<Sig>(&Class::name)) // same, but ambiguous
//	.function("name", (Sig) [](...) { ... })              // arguments need converting
func bindMethod(c *ir.Class, m *ir.Method) string {
	entry := ".function"
	if m.Static {
		entry = ".class_function"
	}

	if !needsBridge(m) {
		target := "&" + m.Spelling()
		if m.Overloaded {
			// static_cast rather than embind's select_overload: deducing the class type
			// through an overload set fails outright when the set contains a function
			// template, which several Filament setters have beside them.
			target = fmt.Sprintf("static_cast<%s>(%s)", memberPointerType(c, m), target)
		}
		return fmt.Sprintf("    %s(%q, %s%s)", entry, m.BoundAs(), target, rawPointers(m))
	}
	return bridgeLambda(c, m, entry)
}

// memberPointerType spells out the exact type of one overload, which is what
// picks it out of the set: "void (Camera::*)(double, double) const noexcept".
// A static method has no class, so it is a plain function pointer.
func memberPointerType(c *ir.Class, m *ir.Method) string {
	params := make([]string, 0, len(m.Params))
	for _, p := range m.Params {
		params = append(params, nativeType(p.Type))
	}

	owner := "*"
	if !m.Static {
		owner = c.Spelling() + "::*"
	}
	signature := fmt.Sprintf("%s (%s)(%s)", nativeType(m.Return), owner, strings.Join(params, ", "))
	if m.Const {
		signature += " const"
	}
	if m.Noexcept {
		signature += " noexcept"
	}
	return signature
}

// rawPointers adds embind's allow_raw_pointers() where a pointer crosses the
// boundary, which embind otherwise refuses to bind.
func rawPointers(m *ir.Method) string {
	if m.Return.Indirection == ir.Pointer {
		return ", allow_raw_pointers()"
	}
	for _, p := range m.Params {
		if p.Type.Indirection == ir.Pointer {
			return ", allow_raw_pointers()"
		}
	}
	return ""
}

// bridgeLambda renders a method whose arguments cannot cross unchanged. embind
// takes a bare lambda only through a function-pointer cast, so the signature is
// written out twice.
func bridgeLambda(c *ir.Class, m *ir.Method, entry string) string {
	self := ""
	if !m.Static {
		self = fmt.Sprintf("%s* self", c.Spelling())
	}

	// The parameters JavaScript passes, and the expressions handed to the native call.
	var jsParams []string
	var nativeArgs []string
	// An array is copied out of JavaScript before the call and, where the callee
	// writes to it, back in afterwards. Both need a statement of their own.
	var before, after []string

	if self != "" {
		jsParams = append(jsParams, self)
	}
	for i, p := range m.Params {
		name := paramName(p, i)
		jsParams = append(jsParams, bridgeType(p.Type)+" "+name)
		if !isArray(p.Type) {
			nativeArgs = append(nativeArgs, fromBridge(name, p.Type))
			continue
		}
		element := arrayElement(p.Type)
		before = append(before, fmt.Sprintf("auto %s_ = emscripten::convertJSArrayToNumberVector<%s>(%s);",
			name, element, name))
		nativeArgs = append(nativeArgs, fmt.Sprintf("reinterpret_cast<%s*>(%s_.data())", elementType(p.Type), name))
		if !p.Type.Const {
			// The callee wrote into the copy, so JavaScript is given it back. There is
			// no way to hand it the buffer itself: the copy is what made the pointer.
			element := fmt.Sprintf("%s_[i]", name)
			if p.Type.Kind == ir.KindBool {
				element = "(bool) " + element
			}
			after = append(after, fmt.Sprintf("for (size_t i = 0; i < %s_.size(); i++) %s.set(i, %s);",
				name, name, element))
		}
	}

	call := fmt.Sprintf("%s(%s)", nativeCall(c, m), strings.Join(nativeArgs, ", "))

	returns := bridgeType(m.Return)
	var body string
	switch {
	case m.Return.Kind == ir.KindVoid:
		body = call + ";"
	case m.Role == ir.RoleFluent || returnsReference(m.Return):
		// Hand back the address: a fluent method so JavaScript can chain, and a
		// returned reference because embind cannot copy an engine-owned object.
		pointer := *m.Return
		pointer.Indirection = ir.Pointer
		returns = nativeType(&pointer)
		body = "return &" + call + ";"
	default:
		body = "return " + toBridge(call, m.Return) + ";"
	}

	if len(after) > 0 && m.Return.Kind != ir.KindVoid {
		// Name the result before writing the arrays back, so the order is the same
		// as it would be if a person had written this.
		result := local("result", m)
		body = fmt.Sprintf("%s %s = %s", returns, result, strings.TrimPrefix(body, "return "))
		after = append(after, "return "+result+";")
	}

	signature := fmt.Sprintf("(%s (*) (%s))", returns, strings.Join(jsParams, ", "))
	lambda := fmt.Sprintf("[](%s) -> %s {", strings.Join(jsParams, ", "), returns)

	lines := []string{fmt.Sprintf("    %s(%q, %s %s", entry, m.BoundAs(), signature, lambda)}
	for _, line := range append(append(before, body), after...) {
		lines = append(lines, "        "+line)
	}
	return strings.Join(append(lines, "    }, allow_raw_pointers())"), "\n")
}

// elementType is the C++ type the copied array is read as: what the pointer
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

// local is a name for something the lambda needs that no parameter has taken,
// nor the copy made beside one. Filament has a parameter called result.
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

// paramName is what the lambda calls a parameter. C++ lets one go unnamed.
func paramName(p *ir.Param, index int) string {
	if p.Name == "" {
		return fmt.Sprintf("arg%d", index)
	}
	return p.Name
}

// nativeCall is the callee: a static method is called through its qualified name,
// an instance method through the self pointer.
func nativeCall(c *ir.Class, m *ir.Method) string {
	if m.Static {
		return m.Spelling()
	}
	return "self->" + m.CallName()
}
