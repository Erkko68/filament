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

// Package ts writes the TypeScript declarations for the embind bindings.
//
// The declarations are not a second opinion about what should be bound: they
// describe what the embind emitter registered, so this package reads the same
// Bind verdicts and never reaches its own. Anything it declares that embind did
// not register is a lie the compiler will believe.
//
// All four modules land in one filament.d.ts, because the package has one entry
// point and one "export as namespace Filament".
package ts

import (
	"os"
	"sort"
	"strings"

	"beamsplitter2/emit/js"
	"beamsplitter2/ir"
)

// Emit writes the declaration file for every module's API, preserving whatever a
// developer has written in the hand-written section at the top.
func Emit(names js.Names, apis []*ir.API, path string) error {
	d := dts{Handwritten: readHandwritten(path)}

	seen := map[string]bool{}
	for _, api := range apis {
		for _, e := range api.Enums {
			if e.Bind && len(e.Values) > 0 && !seen[names.Of(e.CppName)] {
				seen[names.Of(e.CppName)] = true
				d.Enums = append(d.Enums, enumDecl(names, e))
			}
		}
		for _, c := range api.Classes {
			name := names.Of(c.CppName)
			if !c.Bind || seen[name] {
				continue
			}
			seen[name] = true
			// The split matches the registrations exactly: a struct with fields is a
			// value_object, which crosses as a plain JavaScript object and so is an
			// interface; everything else is a handle to a wasm object, and so a class.
			if c.Tag == "struct" && !c.Mutable() && len(c.Fields) > 0 {
				d.Interfaces = append(d.Interfaces, interfaceDecl(names, c))
			} else if c.Tag == "class" || c.Mutable() {
				d.Classes = append(d.Classes, classDecl(names, c))
			}
		}
	}

	d.Aliases = mathAliases(names, apis)

	sortByName(d.Enums, func(e enumView) string { return e.Name })
	sortByName(d.Interfaces, func(i interfaceView) string { return i.Name })
	sortByName(d.Classes, func(c classView) string { return c.Name })
	return os.WriteFile(path, []byte(d.render()), 0644)
}

// mathAliases declares the names the vector and matrix types cross under. They
// are derived from the types the bindings actually register, for the same reason
// the value_array registrations are: the set follows the headers, and a list kept
// by hand falls behind the first time a signature names a new one.
func mathAliases(names js.Names, apis []*ir.API) []aliasView {
	glm := map[int]string{2: "vec2", 3: "vec3", 4: "vec4"}
	used := map[string]string{}

	note := func(t *ir.Type) {
		switch t.Kind {
		case ir.KindMatrix:
			// A matrix crosses as a flattened array, and gl-matrix names both sizes.
			name := tsType(names, t)
			used[name] = "glm." + name + "|number[]"
		case ir.KindVector, ir.KindQuat:
			if t.Scalar == "" {
				return // a dependent type inside a template has no element type
			}
			rows := t.Rows
			if t.Kind == ir.KindQuat {
				rows = 4
			}
			if rows < 2 || rows > 4 {
				return
			}
			// gl-matrix only types the floating-point vectors; the rest are plain
			// arrays, which is what the hand-written aliases have always said.
			spelling := "number[]"
			switch {
			case t.Kind == ir.KindQuat:
				spelling = "glm.quat|number[]"
			case t.Scalar == ir.KindF32 || t.Scalar == ir.KindF64:
				spelling = "glm." + glm[rows] + "|number[]"
			}
			used[mathName(t)] = spelling
		}
	}

	for _, api := range apis {
		for _, c := range api.Classes {
			if !c.Bind {
				continue
			}
			for _, f := range c.Fields {
				if f.Bind {
					note(f.Type)
				}
			}
			for _, m := range c.AllMethods() {
				if !m.Bind {
					continue
				}
				note(m.Return)
				for _, p := range m.Params {
					note(p.Type)
				}
			}
		}
	}

	var out []aliasView
	for name, spelling := range used {
		out = append(out, aliasView{Name: name, Type: spelling})
	}
	sortByName(out, func(a aliasView) string { return a.Name })
	return out
}

func enumDecl(names js.Names, e *ir.Enum) enumView {
	view := enumView{Name: names.Of(e.CppName), Doc: comment(docLines(e.Doc), "")}
	for _, v := range e.Values {
		// The value is written out rather than left implicit: a C++ enumerator can
		// carry any value, and TypeScript would otherwise number them from zero and
		// quietly disagree with the header.
		view.Values = append(view.Values, valueView{Doc: comment(docLines(v.Doc), "    "), Name: v.Name, Value: v.Value})
	}
	return view
}

func interfaceDecl(names js.Names, c *ir.Class) interfaceView {
	view := interfaceView{Name: names.Of(c.CppName), Doc: comment(docLines(c.Doc), "")}
	for _, f := range c.Fields {
		if !f.Bind || f.Static {
			continue
		}
		// Every field is optional. A value_object is built from an object literal,
		// and Filament's own defaults fill in whatever the caller leaves out, so
		// requiring all of them would reject the way these are actually written.
		view.Fields = append(view.Fields, fieldView{
			Doc: comment(docLines(f.Doc), "    "), Name: f.Name, Type: tsType(names, f.Type),
		})
	}
	return view
}

func classDecl(names js.Names, c *ir.Class) classView {
	view := classView{Name: names.Of(c.CppName), Doc: comment(docLines(c.Doc), "")}

	// embind exposes a constructor only where it was given a default one, which is
	// the same condition the registration is written under.
	for _, ctor := range c.Constructors {
		if ctor.Bind && len(ctor.Params) == 0 && !c.Abstract {
			view.Constructor = true
			break
		}
	}
	for _, m := range c.Methods {
		if !m.Bind {
			continue
		}
		view.Methods = append(view.Methods, methodView{
			Doc:    comment(methodDoc(m), "    "),
			Static: m.Static,
			Name:   m.BoundAs(),
			Params: signature(names, m),
			Return: tsType(names, m.Return),
		})
	}
	return view
}

// methodDoc is docLines with the parameters spliced in. They are taken from the
// method rather than from the doc comment because a map has no order, and a
// JSDoc block whose @param tags do not match the signature order is worse than
// none at all.
func methodDoc(m *ir.Method) []string {
	lines := docLines(m.Doc)
	var params []string
	for i, p := range m.Params {
		if p.Doc != "" {
			text := "@param " + paramName(p, i) + " " + strings.Join(strings.Fields(p.Doc), " ")
			// Continuation lines are indented so the tag stays the leftmost thing on
			// the block, which is what makes a long list of them scannable.
			for j, line := range wrap(text, 92) {
				if j > 0 {
					line = "    " + line
				}
				params = append(params, line)
			}
		}
	}
	if len(params) == 0 {
		return lines
	}
	// Ahead of @returns and @see, which docLines already put at the end.
	at := len(lines)
	for i, line := range lines {
		if strings.HasPrefix(line, "@returns") || strings.HasPrefix(line, "@see") {
			at = i
			break
		}
	}
	if at > 0 && lines[at-1] != "" {
		params = append([]string{""}, params...)
	}
	return append(append(append([]string{}, lines[:at]...), params...), lines[at:]...)
}

// docLines turns a parsed Doxygen comment into the body of a JSDoc block, without
// the delimiters: the template decides whether a one-line comment stays on one
// line, which is the only thing that keeps the output readable.
func docLines(doc *ir.Doc) []string {
	if doc == nil {
		return nil
	}
	var lines []string
	add := func(text string) {
		for _, line := range strings.Split(strings.TrimSpace(text), "\n") {
			lines = append(lines, wrap(strings.TrimSpace(line), 92)...)
		}
	}
	blank := func() {
		if len(lines) > 0 && lines[len(lines)-1] != "" {
			lines = append(lines, "")
		}
	}

	// Description is every paragraph including the brief one, so printing both
	// would say the first sentence twice.
	if doc.Description != "" {
		add(doc.Description)
	} else if doc.Brief != "" {
		add(doc.Brief)
	}
	if doc.Deprecated != "" {
		blank()
		add("@deprecated " + doc.Deprecated)
	}
	for _, note := range doc.Notes {
		blank()
		add("@remarks " + note)
	}
	for _, warning := range doc.Warnings {
		blank()
		add("@remarks Warning: " + warning)
	}

	if doc.Returns != "" {
		blank()
		add("@returns " + doc.Returns)
	}
	for _, see := range doc.See {
		add("@see " + see)
	}

	// A trailing blank would render as an empty comment line.
	for len(lines) > 0 && lines[len(lines)-1] == "" {
		lines = lines[:len(lines)-1]
	}
	return lines
}

// wrap breaks a paragraph onto lines short enough to read. Filament's headers
// hold whole paragraphs on one line, and a comment block that runs off the side
// of the editor is a comment nobody reads.
func wrap(text string, width int) []string {
	words := strings.Fields(text)
	if len(words) == 0 {
		return []string{""}
	}
	lines := []string{words[0]}
	for _, word := range words[1:] {
		last := len(lines) - 1
		if len(lines[last])+1+len(word) > width {
			lines = append(lines, word)
			continue
		}
		lines[last] += " " + word
	}
	return lines
}

func sortByName[T any](items []T, name func(T) string) {
	sort.Slice(items, func(i, j int) bool { return name(items[i]) < name(items[j]) })
}
