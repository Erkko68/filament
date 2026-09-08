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

// Passes that run once the verdicts have settled. Each either withdraws a method
// the target cannot tell apart from another, or records something about one that
// survived. Each exists because an emitter reads it: nothing is recorded on spec.

package rules

import (
	"fmt"
	"strings"

	"beamsplitter2/ir"
)

// dropConstTwins keeps one of a const/non-const pair. C++ overloads on constness,
// no target language does, and the two do the same thing, so binding both would be
// a collision with nothing to choose between the halves.
func dropConstTwins(api *ir.API) {
	for _, c := range api.Classes {
		seen := map[string]*ir.Method{}
		for _, m := range c.Methods {
			if !m.Bind {
				continue
			}
			// Signature carries the trailing "const", which is the one difference
			// this rule is looking for.
			key := m.BoundAs() + strings.TrimSuffix(m.Signature, " const")
			twin, ok := seen[key]
			if !ok {
				seen[key] = m
				continue
			}
			if twin.Const == m.Const {
				continue // a genuine ambiguity; the collision rule below handles it
			}
			// Keep the non-const one: it can do everything the const one can.
			loser := m
			if twin.Const {
				loser, seen[key] = twin, m
			}
			loser.Decision = ir.Decision{Bind: false, Rule: "const-twin",
				Reason: "same signature as the non-const overload"}
		}
	}
}

// nameCollidingOverloads gives each of a colliding group a name of its own,
// taken from the parameter that tells them apart.
//
// Engine::destroy has twenty-two overloads and Engine::isValid nineteen, one per
// Filament type, and no target language dispatches on a pointer type. Refusing
// them loses the whole lifecycle of the API for the sake of a name, when the
// name is right there in the signature: destroy(BufferObject*) is
// destroyBufferObject, which is what every hand-written binding of this API has
// called it.
//
// It runs before the collision rule, which still refuses whatever this could not
// name.
func nameCollidingOverloads(api *ir.API, target Target) {
	for _, c := range api.Classes {
		groups := map[string][]*ir.Method{}
		for _, m := range c.Methods {
			if m.Bind {
				groups[target.OverloadKey(m)] = append(groups[target.OverloadKey(m)], m)
			}
		}
		for _, group := range groups {
			if len(group) > 1 {
				rename(group)
			}
		}
	}
}

// rename gives every method in a colliding group a name ending in what its own
// distinguishing parameter is. It renames all of them or none: half a group
// renamed is a group that still collides, under names that no longer say so.
func rename(group []*ir.Method) {
	// Each takes its name from the last parameter that has not already named
	// another: the value is the last argument of a setter, and it is what a caller
	// is choosing between. Where two share it -- setParameter(name, RgbType,
	// float3) and setParameter(name, float3) both end in a float3 -- the one that
	// asks second falls back to the parameter before it, which is how the
	// hand-written bindings spell them too.
	//
	// ponytail: greedy, so a name depends on the order the header declares them
	// in. Stable for a fixed header, and the alternative is an assignment problem
	// for a handful of setters.
	names := make([]string, len(group))
	taken := map[string]bool{}
	for i, m := range group {
		for j := len(m.Params) - 1; j >= 0; j-- {
			suffix := typeName(m.Params[j].Type)
			if suffix == "" || taken[m.BoundAs()+suffix] {
				continue
			}
			names[i] = m.BoundAs() + suffix
			taken[names[i]] = true
			break
		}
		if names[i] == "" {
			return // nothing left to tell this one apart: the group stays refused
		}
	}
	for i, m := range group {
		m.BindName = names[i]
	}
}

// typeName is what a parameter is, in the shape a method name is written in. A
// declaration gives its own name; anything else is spelled the way the target
// languages spell it, since that is what a caller reading the name will expect.
func typeName(t *ir.Type) string {
	if t.Target != "" {
		name := t.Target
		if i := strings.LastIndex(name, "::"); i >= 0 {
			name = name[i+2:]
		}
		return name
	}
	if t.IsMath() {
		// Several numbers: the count is what tells one of these from another, and
		// setPropertyFloat3 is what the hand-written bindings call it.
		element := map[ir.Kind]string{
			ir.KindF32: "Float", ir.KindF64: "Double",
			ir.KindI32: "Int", ir.KindU32: "Uint", ir.KindI16: "Short",
		}[t.Scalar]
		if element == "" {
			return ""
		}
		switch {
		case t.Kind == ir.KindQuat:
			return "Quat" + element
		case t.Cols == t.Rows && t.Cols > 0:
			// A square matrix is mat3f or mat4f in Filament's own spelling, and that
			// is what a caller reading the name will be looking for.
			return fmt.Sprintf("Mat%d%s", t.Rows, strings.ToLower(element[:1]))
		case t.Cols > 0:
			return fmt.Sprintf("Mat%d%d%s", t.Rows, t.Cols, element)
		}
		return fmt.Sprintf("%s%d", element, t.Rows)
	}
	switch t.Kind {
	case ir.KindBool:
		return "Bool"
	case ir.KindI8, ir.KindI16, ir.KindI32, ir.KindU8, ir.KindU16, ir.KindU32:
		return "Int"
	case ir.KindI64, ir.KindU64:
		return "Long"
	case ir.KindF32:
		return "Float"
	case ir.KindF64:
		return "Double"
	case ir.KindString:
		return "String"
	}
	return ""
}

// rejectCollidingOverloads refuses every overload the target cannot tell apart.
//
// This is the one thing no amount of per-signature cleverness catches: whether two
// methods are distinguishable is a property of the target's dispatch, not of their
// C++ types, so the target names the key and this counts the collisions. All of
// them go to the handwritten section, where a person can write the dispatch.
func rejectCollidingOverloads(api *ir.API, target Target) {
	for _, c := range api.Classes {
		counts := map[string]int{}
		// Constructors collide the same way and are dispatched the same way, so they
		// are counted with the rest rather than left to be emitted twice.
		for _, m := range c.AllMethods() {
			if m.Bind {
				counts[target.OverloadKey(m)]++
			}
		}
		for _, m := range c.AllMethods() {
			if n := counts[target.OverloadKey(m)]; m.Bind && n > 1 {
				m.Decision = ir.Decision{Bind: false, Rule: "overload-collision",
					Reason: fmt.Sprintf("%d bound methods share the target key %q",
						n, target.OverloadKey(m))}
			}
		}
	}
}

// markOverloads flags methods whose C++ name is carried by more than one
// declaration, which is what decides whether naming one of them needs a cast.
//
// It counts the C++ name and not the bound one. Giving two overloads names of
// their own settles which of them a caller means; it does not settle which of
// them &Class::name is, and that is the question this answers.
func markOverloads(api *ir.API) {
	for _, c := range api.Classes {
		// Every method of that name counts, bound or not: ambiguity is a property of
		// the C++ declaration, so a name the compiler sees twice needs disambiguating
		// even when only one of the two is bound.
		counts := map[string]int{}
		for _, m := range c.Methods {
			counts[m.Name]++
		}
		for _, m := range c.Methods {
			if m.Bind && counts[m.Name] > 1 {
				m.Overloaded = true
			}
		}
	}
}

// markFluent flags a method that hands back the object it was called on, which the
// emitter returns as a pointer so the call can be chained. This is a fact about the
// signature, not a convention: any method returning a reference or pointer to its
// own class chains, whatever the class is called.
func markFluent(api *ir.API) {
	for _, c := range api.Classes {
		for _, m := range c.Methods {
			if m.Bind && m.Return.Target == c.CppName && m.Return.Indirection != ir.Direct {
				m.Role = ir.RoleFluent
			}
		}
	}
}
