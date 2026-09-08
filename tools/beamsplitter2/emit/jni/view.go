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

package jni

import (
	"embed"
	"strings"
	"text/template"
)

// The boundary between the IR and the generated text: what a template may read,
// and nothing else. Every field is already the exact string that will appear in
// the C++, so the template decides layout and never policy.

//go:embed templates/*.template
var templateFS embed.FS

var templates = template.Must(template.ParseFS(templateFS, "templates/*.template"))

// file is one generated translation unit: the shims for one top-level class and
// whatever is nested inside it.
type file struct {
	Includes []string
	// Helpers copy a value struct to and from its Java counterpart. They are
	// static, so a struct converted in two files is two copies rather than a
	// duplicate symbol.
	Helpers []string
	// Shims are whole functions, built in shim.go.
	Shims []string
	// Handwritten is the section at the foot of the file: what the generator could
	// not do, followed by whatever a developer wrote there last time.
	Handwritten *handwrittenView
}

// handwrittenView is that section.
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
