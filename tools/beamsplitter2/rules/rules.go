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

// Package rules holds the policy that decides what gets bound.
//
// Three kinds of knowledge used to live here together, which is why the list kept
// growing every time a header changed. Each now has its own file:
//
//  1. Facts about C++ that no target language can bind: an operator, a deleted
//     function, a class template, a private member. Those are cpp.go. The set is
//     closed -- it is the C++ language, not an API -- so it does not grow as
//     Filament does.
//
//  2. What one binding target can carry across the boundary. That is not policy
//     about Filament, it is a property of embind (or of any future target), so it
//     belongs to the target: see the Target interface. The target answers about
//     *types*, of which there are finitely many, never about methods, of which
//     there are unboundedly many. A method added to a header is classified with no
//     change here.
//
//  3. Things only a person knows about Filament: that a BufferDescriptor is a
//     buffer, that an Invocable is a callback. Those are filament.go, and it is
//     the only one of the three that grows with the API.
//
// This file is the engine that runs them, plus passes.go, which records what the
// emitters need to know about the methods that survived.
//
// The verdicts are reached by iterating to a fixed point rather than in a fixed
// order, because they depend on each other: a method needs the types it names to
// be bound, and a class needs at least one bindable member. Apply starts from
// "everything is bindable" and takes away until nothing changes, so withdrawing
// one type withdraws everything that named it without any rule spelling out the
// consequences.
package rules

import "beamsplitter2/ir"

// A Target is a binding backend -- embind, JNI, a future one -- answering what it
// can carry. It is the whole of what the rules need to know about a language, and
// implementing it is the whole of what a new backend owes them.
type Target interface {
	// Marshal reports whether this target can carry a type across the boundary.
	// It returns a rule name and a reason to refuse, or "", "" to accept. The rule
	// name is recorded on the entity, so a refusal here explains itself in ir.json
	// and in -explain exactly like a rule in cpp.go.
	Marshal(t *ir.Type) (rule, reason string)

	// OverloadKey is what the target dispatches an overloaded call on. Two bound
	// methods sharing a key are a single function in the target language, so
	// neither can be bound and both go to the handwritten section. embind
	// dispatches on argument count alone; a target that reads argument types would
	// return a finer key and lose fewer methods.
	OverloadKey(m *ir.Method) string
}

// Apply runs every rule over the API for one target and records the outcome on
// each entity.
func Apply(api *ir.API, target Target) {
	// Relabelling comes first: what a type *is* has to be settled before the target
	// is asked whether it can carry one.
	relabelKnownTypes(api)

	for _, e := range api.Enums {
		decideEnum(e)
	}

	// Start optimistic and take away. Beginning from "nothing is bound" would be
	// self-fulfilling, since a method is only bindable if the types it names
	// already are, and no first pass could ever bind anything.
	for _, c := range api.Classes {
		c.Decision = ir.Decision{Bind: true, Rule: "public-class", Reason: "public type with bindable members"}
	}
	// Each pass can only reject, never re-accept, so the count of bound entities
	// falls monotonically and this terminates.
	for previous := -1; previous != bindCount(api); {
		previous = bindCount(api)
		for _, c := range api.Classes {
			for _, m := range c.AllMethods() {
				decideMethod(api, target, c, m)
			}
			for _, f := range c.Fields {
				decideField(api, target, f)
			}
			decideClass(c)
		}
	}

	// Passes that describe rather than reject. Each is named after what it adds,
	// and each exists because an emitter reads it: nothing is recorded on spec.
	nameOperators(api)
	dropConstTwins(api)
	nameCollidingOverloads(api, target)
	rejectCollidingOverloads(api, target)
	markOverloads(api)
	markFluent(api)
}

func decideEnum(e *ir.Enum) {
	switch {
	case e.Template:
		e.Decision = ir.Decision{Bind: false, Rule: "class-template",
			Reason: "declared inside a class template"}
	case e.Underlying == ir.KindI64 || e.Underlying == ir.KindU64:
		// An enum is carried as an int, so a wider one has nowhere to go. This is
		// true of every target the tool has, which is why it is not a Target
		// question; a target that disagrees can bind it back with a Marshal of its
		// own on the enum's type.
		e.Decision = ir.Decision{Bind: false, Rule: "wide-enum",
			Reason: "underlying type is wider than an int"}
	default:
		e.Decision = ir.Decision{Bind: true, Rule: "enum", Reason: "enumerations map directly"}
	}
}

func decideMethod(api *ir.API, target Target, c *ir.Class, m *ir.Method) {
	for _, rule := range MethodRules {
		name, reason := rule.Reject(api, target, c, m)
		if reason == "" {
			continue
		}
		if name == "" {
			name = rule.Name
		}
		m.Decision = ir.Decision{Bind: false, Rule: name, Reason: reason}
		return
	}
	m.Decision = ir.Decision{Bind: true, Rule: "bindable", Reason: "signature maps to the target language"}
}

// decideField is the same walk for a data member, which has no signature and so
// needs only the handful of rules that apply to a single type.
func decideField(api *ir.API, target Target, f *ir.Field) {
	set := func(rule, reason string) { f.Decision = ir.Decision{Bind: false, Rule: rule, Reason: reason} }
	switch {
	case f.Access != "public":
		set("non-public", f.Access+" member")
	case f.Bitfield:
		// &Struct::field is ill-formed for a bit-field, so no target language can
		// reach one directly; it needs an accessor written by hand.
		set("bitfield", "bit-fields have no address")
	case f.Type.Kind == ir.KindUnknown:
		set("unknown-type", "unresolved type "+f.Type.Cpp)
	case f.Type.Indirection == ir.Pointer:
		set("pointer-field", "a copied value cannot carry a raw pointer")
	case !boundType(api, f.Type):
		set("unbound-type", f.Type.Cpp+" is not bound")
	default:
		if rule, reason := target.Marshal(f.Type); reason != "" {
			set(rule, reason)
			return
		}
		f.Decision = ir.Decision{Bind: true, Rule: "public-field", Reason: "public data member"}
	}
}

func decideClass(c *ir.Class) {
	for _, rule := range ClassRules {
		if reason := rule.Reject(c); reason != "" {
			c.Decision = ir.Decision{Bind: false, Rule: rule.Name, Reason: reason}
			return
		}
	}
	c.Decision = ir.Decision{Bind: true, Rule: "public-class", Reason: "public type with bindable members"}
}

// bindCount is the fixed point's measure: the number of entities still bound.
func bindCount(api *ir.API) int {
	n := 0
	for _, e := range api.Enums {
		if e.Bind {
			n++
		}
	}
	for _, c := range api.Classes {
		if c.Bind {
			n++
		}
		for _, m := range c.AllMethods() {
			if m.Bind {
				n++
			}
		}
		for _, f := range c.Fields {
			if f.Bind {
				n++
			}
		}
	}
	return n
}

// boundType reports whether a type can cross the boundary: either it names no
// declaration at all, or it names one this API binds. A target can only marshal a
// type it has been told about, and a signature naming an unbound one either fails
// to compile or throws at call time.
func boundType(api *ir.API, t *ir.Type) bool {
	if t.Target == "" {
		return true
	}
	switch t.Kind {
	case ir.KindClass, ir.KindStruct:
		cls := api.Class(t.Target)
		return cls != nil && cls.Bind
	case ir.KindEnum:
		e := api.Enum(t.Target)
		return e != nil && e.Bind
	}
	return true
}
