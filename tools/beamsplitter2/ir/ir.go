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

// Package ir defines the binding IR: a description of a C++ API together with
// the decision made about every entity in it.
//
// This file is data only. Parsing lives in parse.go and typemap.go; the policy
// that decides what gets bound lives in the rules package. Every field here is
// either a fact clang reported or a verdict a named rule recorded, so a reader of
// ir.json can always tell which is which.
package ir

// Kind is the category of a type, as a string so the JSON dump reads plainly.
type Kind string

const (
	KindVoid     Kind = "void"
	KindBool     Kind = "bool"
	KindI8       Kind = "i8"
	KindI16      Kind = "i16"
	KindI32      Kind = "i32"
	KindI64      Kind = "i64"
	KindU8       Kind = "u8"
	KindU16      Kind = "u16"
	KindU32      Kind = "u32"
	KindU64      Kind = "u64"
	KindF32      Kind = "f32"
	KindF64      Kind = "f64"
	KindString   Kind = "string"
	KindEnum     Kind = "enum"
	KindClass    Kind = "class"
	KindStruct   Kind = "struct"
	KindVector   Kind = "vector"     // math::float3 and friends
	KindMatrix   Kind = "matrix"     // math::mat4f and friends
	KindQuat     Kind = "quaternion" // math::quatf
	KindArray    Kind = "array"      // a fixed C array, "float[3]"
	KindBuffer   Kind = "buffer"     // BufferDescriptor / PixelBufferDescriptor
	KindCallback Kind = "callback"   // Invocable / std::function / *Callback
	KindUnknown  Kind = "unknown"
)

// Indirection records how a type is passed, kept separate from Kind so that
// "float", "float*" and "const float&" are all Kind f32.
type Indirection string

const (
	Direct    Indirection = ""
	Pointer   Indirection = "pointer"
	Reference Indirection = "ref"
	RValueRef Indirection = "rvalue-ref"
)

// Type is a flat description of a C++ type. It is deliberately not a tree: the
// public API uses at most one level of indirection, and a flat struct is far
// easier to read in the JSON dump and to switch on in an emitter.
type Type struct {
	Kind        Kind        `json:"kind"`
	Cpp         string      `json:"cpp"`                 // as written in the header
	Canonical   string      `json:"canonical,omitempty"` // fully desugared
	Indirection Indirection `json:"indirection,omitempty"`
	Const       bool        `json:"const,omitempty"`

	// Target is the qualified name of the class, struct or enum this type names.
	Target string `json:"target,omitempty"`

	// Rows and Cols describe vectors (Rows only), matrices, and the length of a
	// fixed array, taken from clang's template tree rather than guessed: float3 is
	// 3, mat3f is 3x3, float[3] is 3.
	Rows int `json:"rows,omitempty"`
	Cols int `json:"cols,omitempty"`
	// Scalar is the element type of a vector, matrix, quaternion or pointer-slice.
	Scalar Kind `json:"scalar,omitempty"`
}

// IsMath reports whether the type is one of Filament's math value types.
func (t *Type) IsMath() bool {
	return t.Kind == KindVector || t.Kind == KindMatrix || t.Kind == KindQuat
}

// Decision records what the rules concluded about an entity, and which rule
// concluded it. Every Class, Method, Field and Enum carries one, so ir.json
// answers "why is this bound?" for the whole API without any other tooling.
//
// It is embedded rather than named, which is what puts bind/rule/reason at the
// top level of each entity in the JSON instead of under a "decision" key.
type Decision struct {
	Bind   bool   `json:"bind"`
	Rule   string `json:"rule,omitempty"`   // name of the rule that decided
	Reason string `json:"reason,omitempty"` // human-readable justification
}

// Doc is a parsed Doxygen comment.
type Doc struct {
	Brief       string            `json:"brief,omitempty"`
	Description string            `json:"description,omitempty"`
	Params      map[string]string `json:"params,omitempty"`
	Returns     string            `json:"returns,omitempty"`
	See         []string          `json:"see,omitempty"`
	Notes       []string          `json:"notes,omitempty"`
	Warnings    []string          `json:"warnings,omitempty"`
	Deprecated  string            `json:"deprecated,omitempty"`
}

// Param is one parameter of a method.
type Param struct {
	Name    string `json:"name"`
	Type    *Type  `json:"type"`
	Default string `json:"default,omitempty"`
	Doc     string `json:"doc,omitempty"`
}

// MethodKind distinguishes ordinary methods from the special member functions.
type MethodKind string

const (
	Normal      MethodKind = "method"
	Constructor MethodKind = "constructor"
	Operator    MethodKind = "operator"
)

// Role is the binding shape a method takes in a target language. It is a
// conclusion drawn by the rules, not a fact from the header.
type Role string

const (
	RoleFluent Role = "fluent" // builder method returning *this
)

// Method is a member function.
type Method struct {
	Name       string     `json:"name"`
	CppName    string     `json:"cppName"` // fully qualified
	MethodKind MethodKind `json:"methodKind"`
	Line       int        `json:"line,omitempty"`

	Return *Type    `json:"return"`
	Params []*Param `json:"params,omitempty"`

	// Access is the C++ access specifier in effect, as clang reported it. It is a
	// fact, not a verdict: the rules read it to reject a non-public member, which
	// keeps that decision in the rules with all the others.
	Access string `json:"access,omitempty"`

	Static bool `json:"static,omitempty"`
	Const  bool `json:"const,omitempty"`
	// Noexcept is part of the function's type in C++17, so any construct naming
	// that type -- select_overload, a function pointer cast -- has to repeat it.
	Noexcept    bool `json:"noexcept,omitempty"`
	Deleted     bool `json:"deleted,omitempty"`
	Virtual     bool `json:"virtual,omitempty"`
	PureVirtual bool `json:"pureVirtual,omitempty"`

	// Instantiation is the template argument this method is read at, for a member
	// template. C++ will not take the name alone: setParameter is ambiguous,
	// setParameter<float> is a function.
	Instantiation string `json:"instantiation,omitempty"`

	// FunctionType is the method's type exactly as clang printed it, e.g.
	// "void (double, double) const noexcept". Anything that has to name this
	// overload -- a member-pointer cast, a select_overload -- splices into this
	// rather than reassembling it from the parts, which is how the two spellings
	// drift apart.
	FunctionType string `json:"functionType,omitempty"`
	// Signature is the C++ parameter-type list, used to disambiguate overloads.
	Signature string `json:"signature,omitempty"`
	// Overloaded is set when the class has more than one method of this name that
	// survived pruning.
	Overloaded bool `json:"overloaded,omitempty"`

	// BindName is what the target language calls this method, when its C++ name is
	// not something a caller can write. Only operators have one.
	BindName string `json:"bindName,omitempty"`

	Role Role `json:"role,omitempty"`
	Doc  *Doc `json:"doc,omitempty"`

	Decision
}

// Spelling is the method as C++ has to be given it, qualified.
func (m *Method) Spelling() string {
	if m.Instantiation != "" {
		return m.CppName + "<" + m.Instantiation + ">"
	}
	return m.CppName
}

// CallName is the same, as it is written on an object rather than qualified.
func (m *Method) CallName() string {
	if m.Instantiation != "" {
		return m.Name + "<" + m.Instantiation + ">"
	}
	return m.Name
}

// BoundAs is the name a caller in the target language writes. It is the C++ name
// for everything except an operator, which has none.
func (m *Method) BoundAs() string {
	if m.BindName != "" {
		return m.BindName
	}
	return m.Name
}

// Field is a data member.
type Field struct {
	Name   string `json:"name"`
	Type   *Type  `json:"type"`
	Access string `json:"access,omitempty"`
	Static bool   `json:"static,omitempty"`
	// Default is what the member is initialised to where it is declared. A target
	// that builds one of these from nothing -- which is what a value type crossing
	// a boundary by copy comes to -- has no other way to know.
	Default string `json:"default,omitempty"`
	// Bitfield members have no address, so no binding can reference them.
	Bitfield bool `json:"bitfield,omitempty"`
	Doc      *Doc `json:"doc,omitempty"`

	Decision
}

// Class is a C++ class, struct or union.
type Class struct {
	Name      string `json:"name"`
	CppName   string `json:"cppName"` // fully qualified
	Namespace string `json:"namespace,omitempty"`
	Enclosing string `json:"enclosing,omitempty"` // enclosing class, for nested types
	Header    string `json:"header,omitempty"`
	Line      int    `json:"line,omitempty"`
	Tag       string `json:"tag"` // class, struct or union

	// Template marks the primary declaration of a class template. Only concrete
	// specializations can be bound, so the template itself never is.
	Template bool `json:"template,omitempty"`
	// Instantiation is how C++ has to write this class where its name alone is not
	// a type: Manipulator is written Manipulator<float>. Empty for everything
	// else, which is nearly everything.
	Instantiation string `json:"instantiation,omitempty"`
	// NoPublicDestructor marks a class the binding may never delete: Filament keeps
	// the destructors of engine-owned types to itself.
	NoPublicDestructor bool `json:"noPublicDestructor,omitempty"`
	// CopyDeleted marks a type that cannot be copied, and so cannot cross the
	// boundary by value.
	CopyDeleted bool `json:"copyDeleted,omitempty"`
	// DefaultConstructible reports a public zero-argument constructor, which a
	// value type must have to cross the boundary by copy.
	DefaultConstructible bool     `json:"defaultConstructible,omitempty"`
	Abstract             bool     `json:"abstract,omitempty"`
	Polymorphic          bool     `json:"polymorphic,omitempty"`
	Bases                []string `json:"bases,omitempty"`

	Fields       []*Field  `json:"fields,omitempty"`
	Constructors []*Method `json:"constructors,omitempty"`
	Methods      []*Method `json:"methods,omitempty"`

	Doc *Doc `json:"doc,omitempty"`

	Decision
}

// Mutable reports a type with a method that changes it.
//
// A value crosses a boundary by copy, so a method that modifies one would
// modify the copy and nothing else: the caller's object would be unchanged and
// nothing would say so. A type with any such method is a handle, whatever its
// tag says -- which is what a builder is, and Filament writes several of them
// as structs.
func (c *Class) Mutable() bool {
	for _, m := range c.Methods {
		if m.Access == "public" && !m.Static && !m.Const {
			return true
		}
	}
	return false
}

// Spelling is the class as C++ has to be given it.
func (c *Class) Spelling() string {
	if c.Instantiation != "" {
		return c.Instantiation
	}
	return c.CppName
}

// EnumValue is one enumerator.
type EnumValue struct {
	Name  string `json:"name"`
	Value int64  `json:"value"`
	Doc   *Doc   `json:"doc,omitempty"`
}

// Enum is a C++ enum or enum class.
type Enum struct {
	Name      string `json:"name"`
	CppName   string `json:"cppName"`
	Namespace string `json:"namespace,omitempty"`
	Enclosing string `json:"enclosing,omitempty"`
	Header    string `json:"header,omitempty"`
	Line      int    `json:"line,omitempty"`
	Scoped    bool   `json:"scoped,omitempty"` // enum class
	// Template marks an enum declared inside a class template, which shares the
	// template's fate: it can only be named through a concrete specialization.
	Template bool `json:"template,omitempty"`
	// Instantiation is how C++ has to write this enum where the class holding it
	// is a template read at a fixed type. Empty for everything else.
	Instantiation string `json:"instantiation,omitempty"`

	Underlying Kind         `json:"underlying,omitempty"`
	Values     []*EnumValue `json:"values,omitempty"`
	Doc        *Doc         `json:"doc,omitempty"`

	Decision
}

// Spelling is the enum as C++ has to be given it.
func (e *Enum) Spelling() string {
	if e.Instantiation != "" {
		return e.Instantiation
	}
	return e.CppName
}

// API is the whole parsed and decided surface of one target.
type API struct {
	// Name is the target this surface was parsed for. The same header yields
	// different verdicts for different targets, so a dump that did not say which
	// target it came from would be unreadable.
	Name    string   `json:"name,omitempty"`
	Classes []*Class `json:"classes"`
	Enums   []*Enum  `json:"enums"`
}

// Class looks up a class by qualified name.
//
// ponytail: linear scan. The rules call it once per method, so it is O(methods x
// classes); at Filament's size that is a few hundred thousand string compares
// against several seconds of clang, and an index would be the fix if it grew.
func (a *API) Class(cppName string) *Class {
	for _, c := range a.Classes {
		if c.CppName == cppName {
			return c
		}
	}
	return nil
}

// Enum looks up an enum by qualified name.
func (a *API) Enum(cppName string) *Enum {
	for _, e := range a.Enums {
		if e.CppName == cppName {
			return e
		}
	}
	return nil
}

// AllMethods is every member function of the class, constructors first. Almost
// every pass over a class wants both lists, and joining them at each call site is
// how one of them gets forgotten.
func (c *Class) AllMethods() []*Method {
	all := make([]*Method, 0, len(c.Constructors)+len(c.Methods))
	return append(append(all, c.Constructors...), c.Methods...)
}
