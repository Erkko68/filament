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

// Rules that follow from C++ itself, and the one thing C++ leaves unnamed that
// every target has to call something. Nothing here may depend on the target
// language: that is what Target is for, and a rule that asks about one belongs in
// the target's own Marshal.

package rules

import (
	"fmt"
	"strings"

	"beamsplitter2/ir"
)

// A MethodRule inspects one method and either rejects it or passes.
// The first rule to reject wins, and its name is recorded on the method.
type MethodRule struct {
	Name string
	// Reject returns a reason to refuse the method, or "" to let it through. It may
	// also return a rule name to be recorded in place of Name, which is how the
	// target rule attributes its refusals to the target's own reasons.
	Reject func(api *ir.API, target Target, c *ir.Class, m *ir.Method) (rule, reason string)
}

// MethodRules run in order. Earlier rules take precedence, so the most
// fundamental reasons are listed first. Everything here is a fact about C++:
// nothing that depends on the target language may be added.
var MethodRules = []MethodRule{
	{Name: "non-public", Reject: func(api *ir.API, target Target, c *ir.Class, m *ir.Method) (string, string) {
		if m.Access != "public" {
			return "", m.Access + " method"
		}
		return "", ""
	}},

	{Name: "operator", Reject: func(api *ir.API, target Target, c *ir.Class, m *ir.Method) (string, string) {
		if m.MethodKind == ir.Operator && OperatorNames[operatorSymbol(m.Name)] == "" {
			return "", "operators have no cross-language equivalent"
		}
		return "", ""
	}},

	{Name: "deleted", Reject: func(api *ir.API, target Target, c *ir.Class, m *ir.Method) (string, string) {
		if m.Deleted {
			return "", "explicitly deleted"
		}
		return "", ""
	}},

	{Name: "abstract", Reject: func(api *ir.API, target Target, c *ir.Class, m *ir.Method) (string, string) {
		// An abstract class has no constructor to offer whatever its header says,
		// and a binding that offers one does not compile.
		if m.MethodKind == ir.Constructor && c.Abstract {
			return "", "the class is abstract, so there is nothing to construct"
		}
		return "", ""
	}},

	{Name: "copy-or-move", Reject: func(api *ir.API, target Target, c *ir.Class, m *ir.Method) (string, string) {
		if m.MethodKind != ir.Constructor || len(m.Params) != 1 {
			return "", ""
		}
		p := m.Params[0]
		if p.Type.Target == c.CppName && (p.Type.Indirection == ir.Reference || p.Type.Indirection == ir.RValueRef) {
			return "", "copy or move constructor"
		}
		return "", ""
	}},

	{Name: "unknown-type", Reject: func(api *ir.API, target Target, c *ir.Class, m *ir.Method) (string, string) {
		for _, p := range m.Params {
			if p.Type.Kind == ir.KindUnknown {
				return "", fmt.Sprintf("parameter %q has unresolved type %s", p.Name, p.Type.Cpp)
			}
		}
		if m.Return.Kind == ir.KindUnknown {
			return "", "returns unresolved type " + m.Return.Cpp
		}
		return "", ""
	}},

	{Name: "unsized-return", Reject: func(api *ir.API, target Target, c *ir.Class, m *ir.Method) (string, string) {
		// A pointer to a value can be carried as an array, because the caller who
		// supplies one knows how long it is. A pointer that comes back does not have
		// that: nothing on either side knows how much of it there is, and no target
		// language has anywhere to put a bare address.
		if m.Return.Indirection != ir.Pointer {
			return "", ""
		}
		switch {
		case m.Return.IsMath(), m.Return.Kind == ir.KindArray:
			return "", "returns " + m.Return.Cpp + ", an array with no length"
		}
		switch m.Return.Kind {
		case ir.KindBool, ir.KindI8, ir.KindU8, ir.KindI16, ir.KindU16, ir.KindI32,
			ir.KindU32, ir.KindI64, ir.KindU64, ir.KindF32, ir.KindF64:
			return "", "returns " + m.Return.Cpp + ", an array with no length"
		}
		return "", ""
	}},

	{Name: "unmarshalable", Reject: func(api *ir.API, target Target, c *ir.Class, m *ir.Method) (string, string) {
		// The whole of what the target language costs the rules. Everything the old
		// list spelled out method by method -- rvalue references, callbacks, void*,
		// unsized arrays, 64-bit integers -- is one question asked of each type in
		// the signature, so a method added to a header is judged with no change here.
		for _, p := range m.Params {
			if rule, reason := target.Marshal(p.Type); reason != "" {
				return rule, fmt.Sprintf("parameter %q: %s", p.Name, reason)
			}
		}
		if m.MethodKind == ir.Constructor {
			// A constructor's return is the object being made, not a value crossing
			// the boundary. How it is handed over -- by copy, or as the address of
			// something new -- is the emitter's business and not a reason to refuse.
			return "", ""
		}
		if rule, reason := target.Marshal(m.Return); reason != "" {
			return rule, "return type: " + reason
		}
		return "", ""
	}},

	{Name: "unbound-type", Reject: func(api *ir.API, target Target, c *ir.Class, m *ir.Method) (string, string) {
		// A signature can only be bound if every type it names is. This is the rule
		// the fixed point exists for: it reads verdicts reached elsewhere, so it has
		// to be re-asked until they stop changing.
		check := func(what string, t *ir.Type) string {
			if !boundType(api, t) {
				return fmt.Sprintf("%s is %s, which is not bound", what, t.Target)
			}
			return ""
		}
		for _, p := range m.Params {
			if reason := check(fmt.Sprintf("parameter %q", p.Name), p.Type); reason != "" {
				return "", reason
			}
		}
		return "", check("return type", m.Return)
	}},

	{Name: "returns-noncopyable", Reject: func(api *ir.API, target Target, c *ir.Class, m *ir.Method) (string, string) {
		// A value returned across the boundary is copied. A move-only type such as
		// filamat::Package cannot be. A constructor is the exception: it is what
		// makes the object, so nothing is copied.
		if m.MethodKind == ir.Constructor {
			return "", ""
		}
		if m.Return.Indirection != ir.Direct || m.Return.Target == "" {
			return "", ""
		}
		if cls := api.Class(m.Return.Target); cls != nil && cls.CopyDeleted {
			return "", "returns " + m.Return.Target + " by value, which cannot be copied"
		}
		return "", ""
	}},
}

// OperatorNames are the operators a caller can reach under an ordinary name. The
// rest have no equivalent worth writing: assignment is not a call in any target
// language, and ++, -> and unary * exist to make a C++ iterator work, which is a
// loop the target writes for itself.
//
// This is C++ knowledge, not Filament's and not a target's, which is why it sits
// beside the rule that reads it. The names are the ones every language without
// operator overloading already uses.
var OperatorNames = map[string]string{
	"==": "equals",
	"!=": "notEquals",
	"[]": "get",
	"()": "call",
}

func operatorSymbol(methodName string) string {
	return strings.TrimSpace(strings.TrimPrefix(methodName, "operator"))
}

// nameOperators gives every operator that survived the rules the name a caller
// will write. It runs before the passes that count collisions, since two methods
// collide under the name the target sees, not the one C++ gave them.
func nameOperators(api *ir.API) {
	for _, c := range api.Classes {
		for _, m := range c.AllMethods() {
			if m.Bind && m.MethodKind == ir.Operator {
				m.BindName = OperatorNames[operatorSymbol(m.Name)]
			}
		}
	}
}

// ClassRule is the same idea for whole classes.
type ClassRule struct {
	Name   string
	Reject func(c *ir.Class) string
}

// ClassRules run after every member of the class has a verdict, since the last of
// them asks what survived.
var ClassRules = []ClassRule{
	{Name: "anonymous", Reject: func(c *ir.Class) string {
		if c.Name == "" {
			return "anonymous record"
		}
		return ""
	}},

	{Name: "class-template", Reject: func(c *ir.Class) string {
		if c.Template {
			return "class template; only concrete specializations can be bound"
		}
		return ""
	}},

	{Name: "union", Reject: func(c *ir.Class) string {
		// Only one member of a union is valid at a time and nothing in the object
		// records which, so there is no way to read one across a boundary. No target
		// language has an equivalent, which is why this sits here and not in Target.
		if c.Tag == "union" {
			return "a union carries no record of which member is live"
		}
		return ""
	}},

	{Name: "not-default-constructible", Reject: func(c *ir.Class) string {
		// A struct crosses the boundary by copy, which means the target language has
		// to be able to build one from nothing and fill in its fields.
		if c.Tag == "struct" && !c.DefaultConstructible {
			return "value type without a public default constructor"
		}
		if c.Tag == "struct" && c.CopyDeleted {
			return "value type that cannot be copied"
		}
		return ""
	}},

	{Name: "no-public-surface", Reject: func(c *ir.Class) string {
		// A handle type still needs registering even with nothing on it: ColorGrading
		// carries its whole API on its Builder, but View and Engine pass it around by
		// pointer, and embind cannot marshal a type it never saw.
		if c.NoPublicDestructor {
			return ""
		}
		for _, m := range c.Methods {
			if m.Access == "public" {
				return ""
			}
		}
		for _, f := range c.Fields {
			if f.Access == "public" {
				return ""
			}
		}
		if len(c.Methods) == 0 && len(c.Fields) == 0 {
			return "no members"
		}
		return "no public members"
	}},
}
