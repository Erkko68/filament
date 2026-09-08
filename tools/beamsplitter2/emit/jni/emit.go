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
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"beamsplitter2/emit"
	"beamsplitter2/ir"
)

// This file says which declarations go into which file. There is far less of it
// than the embind emitter needs: JNI has no registrations, no value objects and
// no enum tables, so an enum is an int, a struct is refused, and what is left is
// one function per bound method.

// Module is one module's Android output: the library it belongs to, and the Java
// package its symbols are mangled from.
type Module struct {
	emit.Module
	Dir     string // the Android library, relative to the output directory
	Package string
}

// cppDir is where an Android library keeps its native sources. It is the same
// for every one of them, so it is a constant here rather than four copies in the
// module table.
const cppDir = "src/main/cpp"

// EmitAll writes each module's shims and reports the files written, keyed by the
// directory they were written to.
func EmitAll(b Binding, api *ir.API, outDir string, modules []Module) (map[string][]string, error) {
	written := map[string][]string{}
	for _, module := range modules {
		files, err := emitModule(b, api, outDir, module)
		if err != nil {
			return nil, fmt.Errorf("emitting %s: %w", module.Name, err)
		}
		written[module.Dir] = files
	}
	return written, nil
}

func emitModule(b Binding, api *ir.API, outDir string, module Module) ([]string, error) {
	dir := filepath.Join(outDir, module.Dir, cppDir)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}

	var classes []*ir.Class
	for _, c := range api.Classes {
		if c.Bind && module.Owns(c.Header) {
			classes = append(classes, c)
		}
	}

	var written []string
	for _, c := range classes {
		if c.Enclosing != "" {
			continue // written into the file of the class it is nested in
		}
		// Named after the Java class, not the C++ one: two classes that share a
		// short name share a file otherwise, and the second overwrites the first.
		name := b.JavaClass(c) + ".cpp"
		path := filepath.Join(dir, name)
		f := classFile(b, module, c, nested(classes, c), path)
		if len(f.Shims) == 0 && len(f.Handwritten.Missing) == 0 && f.Handwritten.Previous == "" {
			// Nothing to say about this class. A file holding only a banner is one
			// more thing for the build to compile and a reader to open.
			continue
		}
		if err := os.WriteFile(path, []byte(f.render()), 0644); err != nil {
			return nil, err
		}
		written = append(written, name)
	}
	sort.Strings(written)
	return written, nil
}

// nested is every bound class declared inside c, so that a builder is bound
// beside what it builds.
func nested(classes []*ir.Class, c *ir.Class) []*ir.Class {
	var out []*ir.Class
	for _, other := range classes {
		if other != c && strings.HasPrefix(other.CppName, c.CppName+"::") {
			out = append(out, other)
		}
	}
	return out
}

func classFile(b Binding, module Module, c *ir.Class, inner []*ir.Class, path string) file {
	f := file{Includes: []string{c.Header}}
	headers := map[string]bool{c.Header: true}
	classes := append([]*ir.Class{c}, inner...)

	// The value structs this file converts, in the order they are first named, so
	// the helpers are stable across runs.
	var uses []*ir.Class
	seen := map[string]bool{}
	// A value can hold another, and its helper calls that one's, so the members are
	// collected first: a file lists the helpers in the order they can be defined.
	var use func(t *ir.Type)
	use = func(t *ir.Type) {
		v := b.Class(t)
		if !b.IsValue(t) || v == nil || seen[v.CppName] {
			return
		}
		seen[v.CppName] = true
		for _, f := range b.Members(v) {
			use(f.Type)
		}
		uses = append(uses, v)
	}

	for _, cls := range classes {
		if cls.Header != "" && !headers[cls.Header] {
			headers[cls.Header] = true
			f.Includes = append(f.Includes, cls.Header)
		}
		// Its own methods read the value out of the object they were called on.
		use(&ir.Type{Kind: ir.KindStruct, Target: cls.CppName})
		overloads := b.Overloads(cls)
		if b.Owns(cls) {
			f.Shims = append(f.Shims, b.Destructor(module.Package, cls, overloads["nDestroy"] > 1))
		}
		for _, m := range cls.AllMethods() {
			if m.Bind {
				use(m.Return)
				for _, p := range m.Params {
					use(p.Type)
				}
				f.Shims = append(f.Shims, shim(b, module.Package, cls, m, overloads[JavaName(m)] > 1))
			}
		}
	}
	for _, v := range uses {
		if v.Header != "" && !headers[v.Header] {
			headers[v.Header] = true
			f.Includes = append(f.Includes, v.Header)
		}
		f.Helpers = append(f.Helpers, b.helpers(v))
	}
	f.Handwritten = handwritten(module.Package, classes, path)
	for _, h := range extraIncludes(f.Shims) {
		if !headers[h] {
			headers[h] = true
			f.Includes = append(f.Includes, h)
		}
	}
	return f
}

// extraIncludes are the headers the shims need that the class header need not
// have. A signature can name a type the header only forward-declares; the
// expression that converts it cannot be written against a forward declaration.
func extraIncludes(shims []string) []string {
	body := strings.Join(shims, "")
	var out []string
	// The vector and matrix values are written through the templates they are
	// really declared as, which a header taking a mat4 by typedef has not pulled in.
	if strings.Contains(body, "filament::math::") {
		out = append(out, "math/mat4.h", "math/vec4.h")
	}
	for name, s := range smuggled {
		if s.header != "" && strings.Contains(body, name+"::") {
			out = append(out, s.header)
		}
	}
	sort.Strings(out)
	return out
}

// WriteSourceList records what was generated for each module's CMakeLists, which
// needs an explicit list rather than a glob: a glob sweeps up whatever an earlier
// run left behind under a name this one no longer writes.
func WriteSourceList(outDir string, written map[string][]string) error {
	for dir, files := range written {
		var b strings.Builder
		b.WriteString("# This file has been generated by beamsplitter\n\nset(GENERATED_JNI_SRC\n")
		for _, file := range files {
			fmt.Fprintf(&b, "  ${CMAKE_CURRENT_SOURCE_DIR}/%s/%s\n", cppDir, file)
		}
		b.WriteString(")\n")
		// Beside the CMakeLists that will include it, not beside the sources it
		// names: the paths in it are written from the library root.
		path := filepath.Join(outDir, dir, "generated_sources.cmake")
		if err := os.WriteFile(path, []byte(b.String()), 0644); err != nil {
			return err
		}
	}
	return nil
}
