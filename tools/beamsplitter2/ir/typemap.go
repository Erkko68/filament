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

package ir

import (
	"regexp"
	"strconv"
	"strings"

	"beamsplitter2/clang"
)

// typeMap turns clang's type descriptions into ir.Type.
//
// Clang gives a parameter's type as a bare string ("const math::mat4 &") but
// gives every *type declaration* a fully structured tree, with template arguments
// and resolved decl cross-references, when run with -ast-dump-decl-types. So the
// map is built from those trees, and a parameter is handled by stripping its
// const/pointer/reference decoration and looking the remaining name up.
//
// That decoration stripping is the only C++ text this tool parses by hand.
type typeMap struct {
	// byName maps a type name, under each spelling it may be written with, to what
	// clang says it really is.
	byName map[string]*Type
	// enums and records map a declaration name, under each spelling it may be
	// written with, to its qualified name, so a type that is not an alias can still
	// be categorised and pointed at its declaration.
	enums   map[string]string
	records map[string]string
	// spellings maps the name of a template read at a fixed type to the way C++
	// has to be given it. Everything declared inside one is only nameable through
	// the instantiation, so this rewrites those names wherever they are resolved
	// rather than at each of the places that spell one out.
	spellings map[string]string
	// tagOf records whether a qualified name was declared class, struct or union.
	// The distinction matters: a struct is copied across the boundary as a value,
	// a class is handed over as a handle.
	tagOf map[string]string
}

func newTypeMap() *typeMap {
	return &typeMap{
		byName:    map[string]*Type{},
		enums:     map[string]string{},
		records:   map[string]string{},
		spellings: map[string]string{},
		tagOf:     map[string]string{},
	}
}

// scan walks the whole AST and records every type declaration's structured form.
func (tm *typeMap) scan(root *clang.Node) {
	var walk func(n *clang.Node, scope string)
	walk = func(n *clang.Node, scope string) {
		if n == nil {
			return
		}
		inner := scope
		switch n.Kind {
		case "TypeAliasDecl", "TypedefDecl":
			if n.Name != "" {
				if t := tm.fromTree(n); t != nil {
					tm.put(qualify(scope, n.Name), t)
				}
			}
		case "EnumDecl":
			if n.Name != "" {
				inner = qualify(scope, n.Name)
				putSuffixes(tm.enums, inner)
			}
		case "CXXRecordDecl", "ClassTemplateDecl", "ClassTemplateSpecializationDecl":
			// Skip the injected class name: C++ declares every class as a member of
			// itself, so recording it would make "Builder" resolve, from inside
			// Texture::Builder, to Texture::Builder::Builder.
			//
			// Skip incomplete declarations too. An elaborated return type such as
			// "class Frustum getFrustum()" leaves a forward declaration behind, and
			// recording it would shadow the real filament::Frustum.
			incomplete := n.Kind == "CXXRecordDecl" && !n.CompleteDefinition
			// A class template declares the record it defines under its own name, so
			// qualifying again would put Manipulator inside Manipulator and leave
			// everything nested in it a scope deeper than it is.
			if n.Name != "" && !n.IsImplicit && !incomplete && !strings.HasSuffix(scope, "::"+n.Name) && scope != n.Name {
				inner = qualify(scope, n.Name)
				putSuffixes(tm.records, inner)
				if n.TagUsed != "" {
					tm.tagOf[inner] = n.TagUsed
				}
			}
		case "NamespaceDecl":
			if n.Name != "" {
				inner = qualify(scope, n.Name)
			}
		}
		for _, c := range n.Inner {
			walk(c, inner)
		}
	}
	walk(root, "")
}

// put registers a type under its qualified name and under every trailing suffix of
// it, so "filament::math::mat4", "math::mat4" and "mat4" all resolve. Longer keys
// are never overwritten by shorter ones from a different declaration.
func (tm *typeMap) put(qualifiedName string, t *Type) {
	segments := strings.Split(qualifiedName, "::")
	for i := range segments {
		key := strings.Join(segments[i:], "::")
		if existing, ok := tm.byName[key]; ok && i > 0 && !sameType(existing, t) {
			continue
		}
		tm.byName[key] = t
	}
}

// putSuffixes registers a qualified name under itself and every trailing suffix,
// so "filament::Camera::Fov", "Camera::Fov" and "Fov" all reach it. A shorter key
// never displaces a name already claimed by another declaration.
func putSuffixes(index map[string]string, qualifiedName string) {
	segments := strings.Split(qualifiedName, "::")
	for i := range segments {
		key := strings.Join(segments[i:], "::")
		if existing, ok := index[key]; ok && i > 0 && existing != qualifiedName {
			continue
		}
		index[key] = qualifiedName
	}
}

func sameType(a, b *Type) bool {
	return a.Kind == b.Kind && a.Target == b.Target && a.Rows == b.Rows && a.Cols == b.Cols
}

// fromTree reads the structured type tree clang emits beneath a type declaration.
// It descends through the sugar nodes (ElaboratedType, TypedefType, QualType) to
// whatever names a real type underneath.
func (tm *typeMap) fromTree(n *clang.Node) *Type {
	if n == nil {
		return nil
	}
	for _, child := range n.Inner {
		switch child.Kind {
		case "ElaboratedType", "TypedefType", "QualType", "ParenType", "AttributedType":
			if t := tm.fromTree(child); t != nil {
				return t
			}
		case "TemplateSpecializationType":
			return tm.fromSpecialization(child)
		case "RecordType":
			return tm.fromRecord(child)
		case "EnumType":
			name := qual(child)
			return &Type{Kind: KindEnum, Cpp: qual(child), Canonical: name, Target: name}
		case "BuiltinType":
			return &Type{Kind: builtinKind(qual(child)), Cpp: qual(child), Canonical: qual(child)}
		case "PointerType":
			// A pointer alias (e.g. "using cptr = const char*"). The pointee carries
			// the interesting part; mark the indirection and carry on.
			inner := tm.fromTree(child)
			if inner == nil {
				return nil
			}
			out := *inner
			out.Indirection = Pointer
			out.Cpp = qual(child)
			return &out
		}
	}
	return nil
}

// Filament's math types are recognised by the class template they specialize.
// Matching the resolved record name rather than the written one matters: float3 is
// spelled vec3<float>, an alias template, and only the RecordType underneath says
// TVec3<float>.
// The match is anchored to the whole name, not merely present in it. A
// std::variant of pointers to vectors names TVec3 inside its arguments, and a
// pattern that only looks for it decides the variant is a vector.
var (
	vectorTemplate = regexp.MustCompile(`^(?:\w+::)*TVec([234])<`)
	matrixTemplate = regexp.MustCompile(`^(?:\w+::)*TMat([234])([234])<`)
	quatTemplate   = regexp.MustCompile(`^(?:\w+::)*TQuaternion<`)
)

// fromSpecialization reads a template specialization such as TVec3<float>, taking
// the rank from the template it specializes and the scalar from its argument.
func (tm *typeMap) fromSpecialization(n *clang.Node) *Type {
	var scalar Kind
	for _, child := range n.Inner {
		if child.Kind == "TemplateArgument" && (scalar == KindUnknown || scalar == "") {
			scalar = builtinKind(qual(child))
		}
	}
	// An alias template adds a layer of sugar: float3 is vec3<float>, which is
	// itself TVec3<float>. The record at the bottom of the subtree is the real one.
	target := deepestRecord(n)
	if target == "" {
		target = qual(n)
	}

	t := &Type{Cpp: qual(n), Canonical: target, Target: target, Scalar: scalar}
	switch {
	case vectorTemplate.MatchString(target):
		t.Kind = KindVector
		t.Rows = atoi(vectorTemplate.FindStringSubmatch(target)[1])
	case matrixTemplate.MatchString(target):
		m := matrixTemplate.FindStringSubmatch(target)
		t.Kind, t.Rows, t.Cols = KindMatrix, atoi(m[1]), atoi(m[2])
	case quatTemplate.MatchString(target):
		t.Kind, t.Rows = KindQuat, 4
	default:
		t.Kind = KindStruct
	}
	if t.IsMath() {
		// The math types name their template's namespace; callers want the value type.
		t.Target = ""
	}
	return t
}

// deepestRecord returns the qualified name of the innermost RecordType in a type
// subtree, which is the declaration all the surrounding sugar ultimately names.
func deepestRecord(n *clang.Node) string {
	found := ""
	var walk func(*clang.Node)
	walk = func(node *clang.Node) {
		if node == nil {
			return
		}
		if node.Kind == "RecordType" {
			found = qual(node)
		}
		for _, child := range node.Inner {
			walk(child)
		}
	}
	walk(n)
	return found
}

func (tm *typeMap) fromRecord(n *clang.Node) *Type {
	name := qual(n)
	return &Type{Kind: KindStruct, Cpp: qual(n), Canonical: name, Target: name}
}

// Lookup resolves a type as written at a use site: strip the decoration, then ask
// what the remaining name is.
//
// scope is the qualified name of the declaration the type was written inside.
// C++ looks an unqualified name up in the enclosing scopes before the global one,
// and so must this: inside Texture::Builder, "Builder" means Texture::Builder, not
// whichever of the seventeen Builder classes happened to be parsed first.
func (tm *typeMap) Lookup(spelled, desugared, scope string) *Type {
	cpp := strings.TrimSpace(spelled)
	if cpp == "" || cpp == "void" {
		return &Type{Kind: KindVoid, Cpp: "void"}
	}

	bare := elaborated(clean(cpp))
	indirection := Direct
	switch {
	case strings.HasSuffix(bare, "&&"):
		indirection, bare = RValueRef, strings.TrimSpace(strings.TrimSuffix(bare, "&&"))
	case strings.HasSuffix(bare, "&"):
		indirection, bare = Reference, strings.TrimSpace(strings.TrimSuffix(bare, "&"))
	}
	pointerDepth := 0
	for strings.HasSuffix(bare, "*") || strings.HasSuffix(bare, "* const") {
		indirection = Pointer
		pointerDepth++
		bare = strings.TrimSpace(strings.TrimSuffix(bare, "const"))
		bare = strings.TrimSpace(strings.TrimSuffix(bare, "*"))
	}
	if pointerDepth > 1 {
		// "const char **" is an array of strings, not a string; flattening it to one
		// pointer would give every consumer the wrong element type.
		return &Type{Kind: KindUnknown, Cpp: cpp, Canonical: bare, Indirection: Pointer}
	}
	isConst := false
	if strings.HasPrefix(bare, "const ") {
		isConst, bare = true, strings.TrimSpace(strings.TrimPrefix(bare, "const "))
	}
	if strings.HasSuffix(bare, " const") {
		isConst, bare = true, strings.TrimSpace(strings.TrimSuffix(bare, " const"))
	}

	// Strip the keyword last: it can sit behind a cv-qualifier, as in
	// "const class Frustum &".
	bare = elaborated(bare)

	// A fixed C array is several values in a row, which is a shape the IR already
	// has a place for. Only a data member keeps it: a parameter decays to a
	// pointer before clang ever writes the type down.
	if element, count, ok := fixedArray(bare); ok {
		return &Type{Kind: KindArray, Cpp: cpp, Canonical: bare, Const: isConst,
			Scalar: tm.resolveName(element, "", scope).Kind, Rows: count}
	}

	t := tm.resolveName(bare, elaborated(clean(desugared)), scope)
	t.Cpp = cpp
	t.Indirection = indirection
	t.Const = isConst

	// "const char *" is a string, not a pointer to a character. The decoration stays
	// in the usual fields so that consumers can still see it is a pointer.
	if bare == "char" && indirection == Pointer {
		return &Type{Kind: KindString, Cpp: cpp, Canonical: "char",
			Const: isConst, Indirection: Pointer}
	}
	return t
}

// exact resolves a fully spelled name against everything the scan recorded.
func (tm *typeMap) exact(name string) *Type {
	if t, ok := tm.byName[name]; ok {
		out := *t
		return &out
	}
	// The name may not be an alias at all, just a class or enum named directly.
	if qualified, ok := tm.enums[name]; ok {
		return &Type{Kind: KindEnum, Canonical: tm.instantiated(qualified), Target: qualified}
	}
	if qualified, ok := tm.records[name]; ok {
		kind := KindClass
		if tm.tagOf[qualified] == "struct" || tm.tagOf[qualified] == "union" {
			kind = KindStruct
		}
		return &Type{Kind: kind, Canonical: tm.instantiated(qualified), Target: qualified}
	}
	return nil
}

// instantiated is a name written the way C++ will take it: what is declared
// inside Manipulator is only nameable through Manipulator<float>.
func (tm *typeMap) instantiated(name string) string {
	for scope, spelling := range tm.spellings {
		if name == scope {
			return spelling
		}
		if strings.HasPrefix(name, scope+"::") {
			return spelling + name[len(scope):]
		}
	}
	return name
}

// enclosingScopes lists a qualified name and each of its prefixes, innermost first:
// "a::b::c" yields "a::b::c", "a::b", "a".
func enclosingScopes(scope string) []string {
	if scope == "" {
		return nil
	}
	segments := strings.Split(scope, "::")
	out := make([]string, 0, len(segments))
	for i := len(segments); i > 0; i-- {
		out = append(out, strings.Join(segments[:i], "::"))
	}
	return out
}

// resolveName categorises a bare type name, preferring what clang recorded for it.
func (tm *typeMap) resolveName(bare, desugared, scope string) *Type {
	if k := builtinKind(bare); k != KindUnknown {
		return &Type{Kind: k, Canonical: bare}
	}
	// Innermost scope first, then outward, then the global name.
	if !strings.Contains(bare, "::") {
		for _, candidate := range enclosingScopes(scope) {
			if t := tm.exact(candidate + "::" + bare); t != nil {
				return t
			}
		}
	}
	if t := tm.exact(bare); t != nil {
		return t
	}
	// Standard string types are part of the type system rather than Filament policy,
	// so they are recognised here alongside the builtins.
	switch bare {
	case "std::string", "std::string_view", "std::__1::string", "std::__1::string_view":
		return &Type{Kind: KindString, Canonical: bare}
	}
	// A function pointer is a callback whatever it is called. Typedefs like
	// Texture::Callback desugar to "void (*)(void *, size_t, void *)", losing the
	// name, so the shape has to be recognised rather than the spelling.
	if isFunctionPointer(bare) || isFunctionPointer(desugared) {
		return &Type{Kind: KindCallback, Canonical: firstNonEmpty(desugared, bare)}
	}
	// Fall back to whatever clang desugared it to, if anything.
	if desugared != "" && desugared != bare {
		t := tm.resolveName(strings.TrimSpace(strings.TrimPrefix(desugared, "const ")), "", scope)
		if t.Kind != KindUnknown {
			return t
		}
	}
	if k := builtinKind(desugared); k != KindUnknown {
		return &Type{Kind: k, Canonical: desugared}
	}
	return &Type{Kind: KindUnknown, Canonical: firstNonEmpty(desugared, bare), Target: bare}
}

func builtinKind(name string) Kind {
	switch strings.TrimSpace(name) {
	case "void":
		return KindVoid
	case "bool":
		return KindBool
	case "char", "signed char", "int8_t":
		return KindI8
	case "short", "int16_t":
		return KindI16
	case "int", "int32_t":
		return KindI32
	case "long", "long long", "int64_t", "ptrdiff_t":
		return KindI64
	case "unsigned char", "uint8_t":
		return KindU8
	case "unsigned short", "uint16_t":
		return KindU16
	case "unsigned int", "uint32_t":
		return KindU32
	case "unsigned long", "unsigned long long", "uint64_t", "size_t":
		return KindU64
	case "float":
		return KindF32
	case "double":
		return KindF64
	}
	return KindUnknown
}

// elaborated strips the "class"/"struct"/"enum" keyword clang writes in front of a
// type name when the name alone would be ambiguous at the use site.
func elaborated(s string) string {
	for _, keyword := range []string{"class ", "struct ", "union ", "enum "} {
		s = strings.TrimPrefix(s, keyword)
	}
	return strings.TrimSpace(s)
}

// fixedArray splits "float[3]" into what it is an array of and how many.
var arraySuffix = regexp.MustCompile(`^(.*?)\s*\[(\d+)\]$`)

func fixedArray(s string) (string, int, bool) {
	m := arraySuffix.FindStringSubmatch(s)
	if m == nil {
		return "", 0, false
	}
	return strings.TrimSpace(m[1]), atoi(m[2]), true
}

func isFunctionPointer(s string) bool {
	return strings.Contains(s, "(*)(")
}

func atoi(s string) int {
	v, _ := strconv.Atoi(s)
	return v
}

func clean(s string) string {
	for _, attr := range []string{"_Nullable", "_Nonnull", "_Null_unspecified"} {
		s = strings.ReplaceAll(s, attr, "")
	}
	return strings.Join(strings.Fields(s), " ")
}

func qual(n *clang.Node) string {
	if n == nil || n.Type == nil {
		return ""
	}
	return n.Type.QualType
}

func qualify(scope, name string) string {
	if scope == "" {
		return name
	}
	return scope + "::" + name
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}
