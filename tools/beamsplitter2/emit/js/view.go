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
	"embed"
	"strings"
	"text/template"
)

// This file is the boundary between the IR and the generated text: the structs a
// template may read, and nothing else. Every field is already the exact string
// that will appear in the C++, so the templates decide layout and never policy.

//go:embed templates/*.template
var templateFS embed.FS

var templates = template.Must(template.ParseFS(templateFS, "templates/*.template"))

// file is one generated translation unit. Each of the declaration slices holds a
// kind of registration; a file populates only the kinds it emits, so one template
// covers the per-class files and the aggregate ones alike.
type file struct {
	Includes []string
	Symbol   string // the EMSCRIPTEN_BINDINGS block name, unique per binary
	// Opaque names the classes embind must be told it cannot delete.
	Opaque []string

	Classes []classView
	Enums   []enumView
	Structs []structView
	Arrays  []arrayView

	// Handwritten is set only on the per-class files, which are the ones a
	// developer adds to.
	Handwritten *handwrittenView
}

type classView struct {
	CppName, JsName string
	// Constructors are the argument lists embind is told about, "" for the empty
	// one. It dispatches on argument count, so no two can be the same length --
	// which is what the collision rule has already seen to.
	Constructors []string
	// Registrations are whole ".function(...)" lines, already indented: they are
	// C++ expressions built in bind.go, not layout.
	Registrations []string
}

type enumView struct {
	CppName, JsName string
	Values          []nameRef
}

type structView struct {
	CppName, JsName string
	Fields          []nameRef
}

type arrayView struct {
	CppName, JsName string
	Elements        []string // x, y, z, w
}

// nameRef is a member bound under a JavaScript name: the name it takes there, and
// the C++ expression that reaches it.
type nameRef struct {
	Name    string
	CppName string
}

// handwrittenView is the section at the foot of a class file: what the generator
// could not do, followed by whatever a developer wrote there last time.
type handwrittenView struct {
	Missing  []string
	Previous string
}

func (f file) render() string {
	var b strings.Builder
	if err := templates.ExecuteTemplate(&b, "file", f); err != nil {
		panic(err) // the templates are compiled in; a failure here is a bug, not input
	}
	return b.String()
}
