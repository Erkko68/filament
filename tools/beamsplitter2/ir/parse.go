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
	"path/filepath"
	"sort"
	"strings"

	"beamsplitter2/clang"
)

// Parse converts a clang AST into the IR. It records facts only: no entity is
// accepted or rejected here, so every verdict in the output can be traced to a
// named rule in the rules package.
//
// headerFilter selects which files contribute declarations; types from anywhere in
// the translation unit are still resolved, since a public header can name a type
// declared elsewhere.
func Parse(root *clang.Node, headerFilter []string, specializations map[string]map[string]string, instantiations map[string][]string) *API {
	tm := newTypeMap()
	tm.scan(root)

	// A template parameter is a name like any other, so it is registered like one:
	// inside filament::camutils::Manipulator, FLOAT is float. Lookup searches the
	// enclosing scopes before the global one, which is what makes this reach only
	// the template it is meant for.
	for scope, params := range specializations {
		var names, values []string
		for name := range params {
			names = append(names, name)
		}
		sort.Strings(names)
		for _, name := range names {
			values = append(values, params[name])
			if t := tm.resolveName(params[name], "", ""); t.Kind != KindUnknown {
				tm.put(qualify(scope, name), t)
			}
		}

		tm.spellings[scope] = scope + "<" + strings.Join(values, ", ") + ">"

		// The template is also named with its parameters where it is used:
		// Bookmark<FLOAT> is how a Manipulator says Bookmark.
		if t := tm.exact(scope); t != nil {
			tm.put(scope+"<"+strings.Join(names, ", ")+">", t)
		}
	}

	p := &parser{api: &API{}, tm: tm, filter: headerFilter, specialized: specializations, instantiations: instantiations}
	p.walk(root, "")
	markTemplateMembers(p.api)
	return p.api
}

// instantiation is the class written the way C++ needs it: with the arguments
// the one instantiation uses.
func instantiation(cppName string, params map[string]string) string {
	var names []string
	for name := range params {
		names = append(names, name)
	}
	sort.Strings(names)
	values := make([]string, 0, len(names))
	for _, name := range names {
		values = append(values, params[name])
	}
	return cppName + "<" + strings.Join(values, ", ") + ">"
}

// markTemplateMembers propagates a class template's dependence to everything
// declared inside it. The nested declarations are parsed before the template is
// recognised, so this runs once the whole unit is known.
func markTemplateMembers(api *API) {
	var prefixes []string
	for _, c := range api.Classes {
		if c.Template {
			prefixes = append(prefixes, c.CppName+"::")
		}
	}
	inTemplate := func(name string) bool {
		for _, prefix := range prefixes {
			if strings.HasPrefix(name, prefix) {
				return true
			}
		}
		return false
	}
	for _, c := range api.Classes {
		if inTemplate(c.CppName) {
			c.Template = true
		}
	}
	for _, e := range api.Enums {
		if inTemplate(e.CppName) {
			e.Template = true
		}
	}
}

type parser struct {
	api    *API
	tm     *typeMap
	filter []string
	// specialized are the templates read at a fixed type, which are therefore not
	// templates as far as anything downstream is concerned.
	specialized map[string]map[string]string
	// instantiations are the member templates read once per type they are used at.
	instantiations map[string][]string

	// clang stamps loc.file only on the first node of each file, so the current file
	// has to be carried across siblings.
	file string
}

func (p *parser) inTarget() bool {
	if len(p.filter) == 0 {
		return true
	}
	if p.file == "" {
		return false // unknown provenance is not a target
	}
	for _, want := range p.filter {
		if strings.Contains(p.file, want) {
			return true
		}
	}
	return false
}

func (p *parser) walk(n *clang.Node, namespace string) {
	if n == nil {
		return
	}
	if f := n.File(); f != "" {
		p.file = f
	}

	switch n.Kind {
	case "NamespaceDecl":
		if n.Name == "std" || strings.HasPrefix(n.Name, "__") {
			return
		}
		for _, c := range n.Inner {
			p.walk(c, qualify(namespace, n.Name))
		}

	case "CXXRecordDecl":
		if n.CompleteDefinition && !n.IsImplicit && n.Name != "" && p.inTarget() {
			p.api.Classes = append(p.api.Classes, p.class(n, namespace, "", namespace))
		}

	case "ClassTemplateDecl":
		// The template wraps the record it declares. Parse it so the IR can say why
		// it was rejected, rather than dropping it without explanation.
		for _, c := range n.Inner {
			if c.Kind == "CXXRecordDecl" && c.CompleteDefinition && c.Name != "" && p.inTarget() {
				cls := p.class(c, namespace, "", namespace)
				cls.Template = p.specialized[cls.CppName] == nil
				if params := p.specialized[cls.CppName]; params != nil {
					cls.Instantiation = instantiation(cls.CppName, params)
				}
				p.api.Classes = append(p.api.Classes, cls)
			}
		}

	case "EnumDecl":
		if !n.IsImplicit && n.Name != "" && p.inTarget() {
			p.api.Enums = append(p.api.Enums, p.enum(n, namespace, "", namespace))
		}

	default:
		for _, c := range n.Inner {
			p.walk(c, namespace)
		}
	}
}

func (p *parser) class(n *clang.Node, namespace, enclosing, spellingScope string) *Class {
	tag := "class"
	if n.TagUsed != "" {
		tag = n.TagUsed
	}
	qname := qualify(namespace, n.Name)
	// What C++ has to be given for this class. It differs from the name only for a
	// template read at a fixed type, where every member of it has to be named
	// through the instantiation rather than the template.
	spelling := qualify(spellingScope, n.Name)
	if params := p.specialized[qname]; params != nil {
		spelling = instantiation(qname, params)
	}

	file := n.File()
	if file == "" {
		file = p.file
	}

	c := &Class{
		Name:      n.Name,
		CppName:   qname,
		Namespace: namespace,
		Enclosing: enclosing,
		Header:    headerPath(file),
		Line:      n.Line(),
		Tag:       tag,
		Doc:       parseDoc(n),
	}
	if spelling != qname {
		c.Instantiation = spelling
	}

	// Struct members are public by default, class members private.
	access := "private"
	if tag == "struct" || tag == "union" {
		access = "public"
	}

	for _, child := range n.Inner {
		switch child.Kind {
		case "AccessSpecDecl":
			access = child.Access

		case "CXXBaseSpecifier":
			if base := qual(child); base != "" {
				c.Bases = append(c.Bases, base)
			}

		case "CXXConstructorDecl":
			if !child.IsImplicit {
				c.Constructors = append(c.Constructors, p.method(child, qname, spelling, access, Constructor))
			}

		case "CXXDestructorDecl":
			// The only thing a binding needs from a destructor is whether it may call
			// it. Filament hides the destructors of engine-owned types.
			destructorAccess := access
			if child.Access != "" {
				destructorAccess = child.Access
			}
			c.NoPublicDestructor = destructorAccess != "public"

		case "CXXMethodDecl":
			if !child.IsImplicit {
				kind := Normal
				if strings.HasPrefix(child.Name, "operator") {
					kind = Operator
				}
				c.Methods = append(c.Methods, p.method(child, qname, spelling, access, kind))
			}

		case "FunctionTemplateDecl":
			// A member template is not a function. One is made per type the API uses
			// it at, all under the same name, which leaves them ordinary overloads.
			for _, m := range p.instantiate(child, qname, spelling, access) {
				c.Methods = append(c.Methods, m)
			}

		case "FieldDecl", "VarDecl":
			if !child.IsImplicit {
				field := &Field{
					Name:     child.Name,
					Type:     p.tm.Lookup(qual(child), desugared(child), qname),
					Access:   access,
					Static:   child.Kind == "VarDecl",
					Bitfield: child.IsBitfield,
					Doc:      parseDoc(child),
				}
				if v, ok := memberDefault(child); ok {
					field.Default = v
				}
				c.Fields = append(c.Fields, field)
			}

		case "EnumDecl":
			if !child.IsImplicit && child.Name != "" && access == "public" {
				p.api.Enums = append(p.api.Enums, p.enum(child, qname, n.Name, spelling))
			}

		case "CXXRecordDecl":
			if !child.IsImplicit && child.Name != "" && child.CompleteDefinition && access == "public" {
				p.api.Classes = append(p.api.Classes, p.class(child, qname, n.Name, spelling))
			}
		}
	}

	for _, m := range c.Methods {
		if m.Virtual {
			c.Polymorphic = true
		}
		if m.PureVirtual {
			c.Abstract = true
		}
	}

	for _, ctor := range c.Constructors {
		if ctor.Deleted && len(ctor.Params) == 1 && ctor.Params[0].Type.Target == qname {
			c.CopyDeleted = true
		}
	}

	// A type with no user-declared constructor at all is default constructible.
	c.DefaultConstructible = len(c.Constructors) == 0
	for _, ctor := range c.Constructors {
		if len(ctor.Params) == 0 && !ctor.Deleted && ctor.Access == "public" {
			c.DefaultConstructible = true
		}
	}
	return c
}

// instantiate reads a member template once per type it is used at, with the
// parameter replaced by that type.
func (p *parser) instantiate(n *clang.Node, scope, spelling, access string) []*Method {
	var param string
	var decl *clang.Node
	for _, child := range n.Inner {
		switch {
		case child.Kind == "TemplateTypeParmDecl" && child.Name != "" && param == "":
			param = child.Name
		case child.Kind == "CXXMethodDecl" && decl == nil:
			decl = child
		}
	}
	if param == "" || decl == nil || decl.IsImplicit {
		return nil
	}

	var out []*Method
	for _, argument := range p.instantiations[scope+"::"+decl.Name] {
		with := p.tm.Lookup(argument, "", scope)
		if with.Kind == KindUnknown {
			continue
		}
		m := p.method(decl, scope, spelling, access, Normal)
		m.Instantiation = argument
		m.Return = substitute(m.Return, param, with)
		for _, arg := range m.Params {
			arg.Type = substitute(arg.Type, param, with)
		}
		out = append(out, m)
	}
	return out
}

// substitute puts the instantiation's type where the template parameter was,
// keeping how the parameter was passed: a T taken by const reference is that
// type taken by const reference.
//
// The parameter is recognised by how it was written rather than by what it
// resolved to. Filament guards these templates with a trait, and clang answers
// what T is from inside that guard: decay_t<decltype(*p)>, which is a true
// answer to a question nobody asked.
func substitute(t *Type, param string, with *Type) *Type {
	if t == nil || (written(t.Cpp) != param && t.Canonical != param && t.Target != param) {
		return t
	}
	out := *with
	out.Indirection, out.Const = t.Indirection, t.Const
	return &out
}

// written is a type as the header spells it, with the decoration taken off --
// including the nullability clang appends, which is part of neither the type nor
// its indirection.
func written(cpp string) string {
	for _, attribute := range []string{"_Nonnull", "_Nullable", "_Null_unspecified"} {
		cpp = strings.ReplaceAll(cpp, attribute, "")
	}
	cpp = strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(cpp), "const "))
	cpp = strings.TrimSpace(strings.TrimRight(cpp, "&* "))
	return strings.TrimSpace(strings.TrimSuffix(cpp, " const"))
}

func (p *parser) method(n *clang.Node, scope, spelling, access string, kind MethodKind) *Method {
	signature := qual(n) // e.g. "void (int, float) const"

	m := &Method{
		Name:         n.Name,
		CppName:      spelling + "::" + n.Name,
		MethodKind:   kind,
		Access:       access,
		Line:         n.Line(),
		Return:       p.tm.Lookup(returnOf(signature), returnOf(desugared(n)), scope),
		Static:       n.StorageClass == "static",
		Const:        isConstMethod(signature),
		Noexcept:     strings.Contains(signature, "noexcept"),
		Deleted:      n.ExplicitlyDeleted,
		Virtual:      n.Virtual,
		PureVirtual:  n.Pure,
		FunctionType: signature,
		Signature:    paramsOf(signature),
		Doc:          parseDoc(n),
	}
	if kind == Constructor {
		m.Return = &Type{Kind: KindClass, Cpp: spelling, Canonical: spelling, Target: scope}
	}

	for _, child := range n.Inner {
		if child.Kind != "ParmVarDecl" {
			continue
		}
		param := &Param{
			Name: child.Name,
			Type: p.tm.Lookup(qual(child), desugared(child), scope),
		}
		if v, ok := defaultValue(child); ok {
			param.Default = v
		}
		if m.Doc != nil {
			param.Doc = m.Doc.Params[child.Name]
		}
		m.Params = append(m.Params, param)
	}

	return m
}

func (p *parser) enum(n *clang.Node, namespace, enclosing, spellingScope string) *Enum {
	file := n.File()
	if file == "" {
		file = p.file
	}
	e := &Enum{
		Name:      n.Name,
		CppName:   qualify(namespace, n.Name),
		Namespace: namespace,
		Enclosing: enclosing,
		Header:    headerPath(file),
		Line:      n.Line(),
		Scoped:    n.TagUsed == "class" || n.TagUsed == "struct",
		Doc:       parseDoc(n),
	}
	if spelling := qualify(spellingScope, n.Name); spelling != e.CppName {
		e.Instantiation = spelling
	}
	if n.FixedUnderlyingType != nil {
		e.Underlying = builtinKind(n.FixedUnderlyingType.QualType)
	}

	next := int64(0)
	for _, child := range n.Inner {
		if child.Kind != "EnumConstantDecl" {
			continue
		}
		value := next
		if v, ok := enumValue(child); ok {
			value = v
		}
		e.Values = append(e.Values, &EnumValue{Name: child.Name, Value: value, Doc: parseDoc(child)})
		next = value + 1
	}
	return e
}

// headerPath shortens an absolute path to the form used in #include directives.
func headerPath(full string) string {
	if full == "" {
		return ""
	}
	if i := strings.Index(full, "filament/include/"); i >= 0 {
		return full[i+len("filament/include/"):]
	}
	if i := strings.Index(full, "backend/include/"); i >= 0 {
		return full[i+len("backend/include/"):]
	}
	for _, marker := range []string{"/include/", "libs/"} {
		if i := strings.Index(full, marker); i >= 0 {
			return full[i+len(marker):]
		}
	}
	return filepath.Base(full)
}
