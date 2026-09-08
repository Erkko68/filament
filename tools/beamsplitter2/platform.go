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

package main

import (
	"fmt"
	"path/filepath"
	"sort"
	"strings"

	"beamsplitter2/emit/java"
	"beamsplitter2/emit/jni"
	"beamsplitter2/emit/js"
	"beamsplitter2/emit/ts"
	"beamsplitter2/ir"
	"beamsplitter2/rules"
)

// A platform is one language's bindings. Parsing and the rules that follow from
// C++ are shared; what a platform brings is which types it can carry, and what
// files it writes for a set of parsed targets.
//
// Everything platform-specific about the pipeline is in this table. Adding one
// means writing an emitter and a rules.Target, and a line here.
//
// A platform is a boundary, not an output format. TypeScript is not one: the
// declarations describe the embind bindings rather than deciding anything, and
// on their own they would describe nothing, so emitJS writes them. A platform is
// what has an opinion about which types can cross.
type platform struct {
	// Rules answers what this platform can carry across the boundary. It is built
	// from the parsed API, because one of those answers can depend on what a type
	// is made of. The verdicts in the IR are reached against it, so an API parsed
	// for one platform must not be handed to another.
	Rules func(*ir.API) rules.Target
	Emit  func(all []*ir.API, targets []Target, outDir string) error
}

var platforms = map[string]platform{
	"js":  {Rules: func(*ir.API) rules.Target { return js.Target{} }, Emit: emitJS},
	"jni": {Rules: func(api *ir.API) rules.Target { return jni.NewTarget(api) }, Emit: emitJNI},
}

func platformNames() string {
	names := make([]string, 0, len(platforms))
	for name := range platforms {
		names = append(names, name)
	}
	sort.Strings(names)
	return strings.Join(names, ", ")
}

// emitJS writes the embind bindings, the TypeScript declarations and the list of
// what it wrote. The order and the spread across targets are the JavaScript
// build's business, which is why they are here and not in run.
func emitJS(all []*ir.API, targets []Target, outDir string) error {
	// One set of names for every target: the declarations are one document, so a
	// name has to mean the same thing across the binaries as well as within one.
	names := js.NewNames(all)

	written := map[string][]string{}
	for i, target := range targets {
		files, err := js.EmitAll(names, all[i], outDir, target.Modules)
		if err != nil {
			return err
		}
		for module, names := range files {
			written[module] = names
		}
	}
	// The declarations cover every module in one file, so they are written once
	// every target has been parsed rather than per target like the bindings.
	if err := ts.Emit(names, all, filepath.Join(outDir, "filament.d.ts")); err != nil {
		return err
	}
	return js.WriteSourceList(outDir, written)
}

// jniModules is which Android library each module's bindings belong to. The
// directory is relative to -emit, and the package is what the JNI symbol names
// are mangled from, so it has to be the package the Java side actually declares.
var jniModules = map[string]struct{ Dir, Package string }{
	"filament":       {"filament-android", "com.google.android.filament"},
	"filament-utils": {"filament-utils-android", "com.google.android.filament.utils"},
	"gltfio":         {"gltfio-android", "com.google.android.filament.gltfio"},
	"filamat":        {"filamat-android", "com.google.android.filament.filamat"},
}

// emitJNI writes the shims for every module, into the Android library that owns
// each one. There is no equivalent of the TypeScript declarations: the Java side
// is not generated, and until it is these symbols are what it has to be written
// against.
func emitJNI(all []*ir.API, targets []Target, outDir string) error {
	written := map[string][]string{}
	for i, target := range targets {
		var modules []jni.Module
		for _, m := range target.Modules {
			where, ok := jniModules[m.Name]
			if !ok {
				return fmt.Errorf("module %q has no Android library; add it to jniModules", m.Name)
			}
			modules = append(modules, jni.Module{Module: m, Dir: where.Dir, Package: where.Package})
		}
		// One binding for both halves: which structs cross as values and which
		// package each class is in have to be the same answer on either side.
		b := jni.NewBinding(all[i], modules)
		files, err := jni.EmitAll(b, all[i], outDir, modules)
		if err != nil {
			return err
		}
		for dir, names := range files {
			written[dir] = names
		}

		// The Java half, from the same table. It is not a platform of its own: a
		// native declaration with no shim behind it throws at the first call, and a
		// shim with no declaration is dead code.
		var javaModules []java.Module
		for _, m := range modules {
			javaModules = append(javaModules, java.Module{Module: m.Module, Dir: m.Dir, Package: m.Package})
		}
		if _, err := java.EmitAll(b, all[i], outDir, javaModules); err != nil {
			return err
		}
	}
	return jni.WriteSourceList(outDir, written)
}
