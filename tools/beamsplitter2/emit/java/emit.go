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

// Package java emits the Java half of the JNI bindings: the classes that declare
// the natives the shims define.
//
// It is not a platform of its own. A native declaration with no shim behind it
// throws at the first call and a shim with no declaration is dead code, so the
// two halves are generated together and from the same table -- every name and
// type here comes from the jni package rather than being spelled again.
package java

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"beamsplitter2/emit"
	"beamsplitter2/emit/jni"
	"beamsplitter2/ir"
)

// Module is one module's Java output: where the sources go, and the package
// they declare. The package must be the one the shims were mangled from.
type Module struct {
	emit.Module
	Dir     string // the Android library, relative to the output directory
	Package string
}

// javaDir is where an Android library keeps its Java, so these land beside the
// hand-written classes exactly as the shims land beside the hand-written JNI.
// Nothing collides, because the generated classes carry the suffix in their
// names as well as their files -- which they have to, since Java ties the two
// together.
//
// Unlike the shims, these are built: Gradle compiles the whole source root,
// where CMake is handed an explicit list.
const javaDir = "src/main/java"

// EmitAll writes each module's classes and reports the files written, keyed by
// the directory they were written to.
func EmitAll(b jni.Binding, api *ir.API, outDir string, modules []Module) (map[string][]string, error) {
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

func emitModule(b jni.Binding, api *ir.API, outDir string, module Module) ([]string, error) {
	dir := filepath.Join(outDir, module.Dir, javaDir,
		filepath.Join(strings.Split(module.Package, ".")...))
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
			continue // a nested class is written inside the class it is nested in
		}
		v := classView(b, api, module, c, classes)
		if len(v.Class.Methods) == 0 && len(v.Class.Nested) == 0 && len(v.Class.Fields) == 0 {
			// A class with nothing bound, nothing nested and no members is a handle
			// and a constructor: nothing a caller could do with it that they cannot
			// do with the long they already have.
			continue
		}
		// A public class has to live in a file named after it, so the suffix is on
		// both or on neither -- and the name is the one the shims were mangled
		// from, which is not always the short one.
		name := b.JavaClass(c) + ".java"
		if err := os.WriteFile(filepath.Join(dir, name), []byte(render(v)), 0644); err != nil {
			return nil, err
		}
		written = append(written, name)
	}
	sort.Strings(written)
	return written, nil
}
