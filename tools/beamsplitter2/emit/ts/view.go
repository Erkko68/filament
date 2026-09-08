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

package ts

import (
	"embed"
	"os"
	"strings"
	"text/template"
)

// This file is the boundary between the IR and the generated text: the structs a
// template may read, and nothing else. Every field is already the exact string
// that will appear in the output, so the template decides layout and never policy.

//go:embed templates/*.template
var templateFS embed.FS

var templates = template.Must(template.ParseFS(templateFS, "templates/*.template"))

// dts is the whole declaration file.
type dts struct {
	// Handwritten is the preamble, kept verbatim from the previous run: the glm
	// aliases, the loader functions, and the types the JavaScript helpers add at
	// runtime, none of which any header describes.
	Handwritten string

	// Aliases name the vector and matrix types, which cross as plain arrays.
	Aliases    []aliasView
	Enums      []enumView
	Interfaces []interfaceView
	Classes    []classView
}

type aliasView struct {
	Name string
	Type string
}

type enumView struct {
	Name   string
	Doc    string
	Values []valueView
}

type valueView struct {
	Doc   string
	Name  string
	Value int64
}

// interfaceView is a value_object: an object literal crossing by copy.
type interfaceView struct {
	Name   string
	Doc    string
	Fields []fieldView
}

type fieldView struct {
	Doc  string
	Name string
	Type string
}

// classView is a handle to an object living in wasm.
type classView struct {
	Name string
	Doc  string
	// Constructor reports the default constructor embind was given, and is the only
	// one it can express.
	Constructor bool
	Methods     []methodView
}

type methodView struct {
	Doc    string
	Static bool
	Name   string
	Params string
	Return string
}

// comment renders a JSDoc block at the given indent, or "" when there is nothing
// to say. It is built here rather than in the template because a template cannot
// carry an indent through a range without a wrapper struct per level, and the
// indent is the only thing that keeps a nested block readable.
func comment(lines []string, indent string) string {
	if len(lines) == 0 {
		return ""
	}
	if len(lines) == 1 {
		return indent + "/** " + lines[0] + " */\n"
	}
	var b strings.Builder
	b.WriteString(indent + "/**\n")
	for _, line := range lines {
		b.WriteString(strings.TrimRight(indent+" * "+line, " ") + "\n")
	}
	b.WriteString(indent + " */\n")
	return b.String()
}

func (d dts) render() string {
	var b strings.Builder
	if err := templates.ExecuteTemplate(&b, "dts", d); err != nil {
		panic(err) // the templates are compiled in; a failure here is a bug, not input
	}
	return b.String()
}

// The generated declarations start at this line, and everything above it is the
// developer's. The marker is what makes regeneration safe: without it a run would
// overwrite a preamble that no header could reproduce.
const generatedMarker = "// ===== GENERATED DECLARATIONS ====="

// readHandwritten recovers the preamble from the file this run is about to
// overwrite. A file with no marker is not one this generator wrote, so nothing is
// claimed from it and the caller is left to merge by hand.
func readHandwritten(path string) string {
	content, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	text := string(content)
	if i := strings.Index(text, generatedMarker); i >= 0 {
		return strings.TrimRight(text[:i], "\n")
	}
	return ""
}
