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

// Command beamsplitter2 reads Filament's public C++ headers and writes a binding
// IR: every class, enum and method, together with the decision made about it and
// the rule that made it.
//
//	beamsplitter2 -out ir.json          # the whole public API
//	beamsplitter2 -header filament/Camera.h
//	beamsplitter2 -explain Camera       # why each member was or was not bound
//	beamsplitter2 -emit web/filament-js # write the bindings
//
// The verdicts depend on which language the bindings are for, so -platform
// selects one; see platform.go for what a platform owes the pipeline.
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"

	"beamsplitter2/clang"
	"beamsplitter2/emit"
	"beamsplitter2/ir"
	"beamsplitter2/rules"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	header := flag.String("header", "", "parse a single header instead of the full public API")
	out := flag.String("out", "", "write the IR as JSON to this file (default: stdout)")
	explain := flag.String("explain", "", "print the decision for each member of a class, then exit")
	emitDir := flag.String("emit", "", "write bindings into this directory")
	name := flag.String("platform", "js", "which bindings to emit: "+platformNames())
	includes := flag.Bool("includes", false, "print the include directories the headers are parsed with, then exit")
	flag.Parse()

	// Anything that compiles what this tool writes needs the same include path the
	// headers were parsed with. Printing it keeps that list in modules.go instead of
	// copied into a build script, where it silently falls behind.
	if *includes {
		for _, dir := range allIncludes() {
			fmt.Println(dir)
		}
		return nil
	}

	p, ok := platforms[*name]
	if !ok {
		return fmt.Errorf("unknown platform %q; known platforms: %s", *name, platformNames())
	}

	// A single header is a debugging aid: parse just that, with every include
	// directory available, and report on it.
	targets := Targets
	if *header != "" {
		targets = []Target{singleHeaderTarget(*header)}
	}

	root := repoRoot()
	var all []*ir.API
	for _, target := range targets {
		api, err := parse(root, target, p.Rules)
		if err != nil {
			return fmt.Errorf("%s: %w", target.Name, err)
		}
		all = append(all, api)
	}

	// Everything is parsed before anything is written, because a platform writes
	// files that span targets -- the TypeScript declarations and the source list
	// both do -- and because -explain has to look in all of them.
	switch {
	case *explain != "":
		return explainClass(all, *explain)
	case *emitDir != "":
		return p.Emit(all, targets, *emitDir)
	default:
		// Every target in one document. Writing them one at a time would have each
		// truncate the last, leaving only whichever target happened to be parsed
		// last with no sign the others existed.
		return writeIR(all, *out)
	}
}

// parse runs one target's headers through clang and the rules.
func parse(root string, target Target, backend func(*ir.API) rules.Target) (*ir.API, error) {
	includeDirs := make([]string, 0, len(target.Includes))
	for _, dir := range target.Includes {
		includeDirs = append(includeDirs, filepath.Join(root, dir))
	}

	// One umbrella header keeps the target in a single translation unit, so a type
	// has the same identity everywhere it is named.
	headerPath, cleanup, err := umbrella(target.AllHeaders())
	if err != nil {
		return nil, err
	}
	defer cleanup()

	log.Printf("%s: parsing %d headers", target.Name, len(target.AllHeaders()))
	ast, err := clang.DumpAST(clang.DumpOptions{
		HeaderPath:  headerPath,
		IncludeDirs: includeDirs,
	})
	if err != nil {
		return nil, err
	}

	api := ir.Parse(ast, target.AllHeaders(), rules.Specializations, rules.Instantiations)
	api.Name = target.Name
	rules.Apply(api, backend(api))

	bound := 0
	for _, c := range api.Classes {
		if c.Bind {
			bound++
		}
	}
	log.Printf("%s: %d classes (%d bound), %d enums", target.Name, len(api.Classes), bound, len(api.Enums))
	return api, nil
}

// writeIR dumps every target's IR as one JSON array, to a file or to stdout.
func writeIR(all []*ir.API, out string) error {
	w := os.Stdout
	if out != "" {
		f, err := os.Create(out)
		if err != nil {
			return err
		}
		defer f.Close()
		w = f
	}
	enc := json.NewEncoder(w)
	enc.SetIndent("", "  ")
	return enc.Encode(all)
}

// allIncludes is every target's include directories, in a stable order and
// without repeats.
func allIncludes() []string {
	var out []string
	seen := map[string]bool{}
	for _, t := range Targets {
		for _, dir := range t.Includes {
			if !seen[dir] {
				seen[dir] = true
				out = append(out, dir)
			}
		}
	}
	sort.Strings(out)
	return out
}

// singleHeaderTarget wraps one header so -header can use the same pipeline.
//
// The header is named as an #include names it, since that is how clang will look
// for it. A path copied out of the repository carries an include directory in
// front of that name, so it is trimmed back off.
func singleHeaderTarget(header string) Target {
	includes := allIncludes()
	for _, dir := range includes {
		if trimmed := strings.TrimPrefix(header, dir+"/"); trimmed != header {
			header = trimmed
			break
		}
	}
	return Target{
		Name:     header,
		Includes: includes,
		Modules:  []emit.Module{{Name: "filament", Headers: []string{header}}},
	}
}

func umbrella(headers []string) (string, func(), error) {
	f, err := os.CreateTemp("", "filament_public_*.h")
	if err != nil {
		return "", nil, err
	}
	var sb strings.Builder
	for _, h := range headers {
		fmt.Fprintf(&sb, "#include <%s>\n", h)
	}
	if _, err := f.WriteString(sb.String()); err != nil {
		f.Close()
		os.Remove(f.Name())
		return "", nil, err
	}
	f.Close()
	return f.Name(), func() { os.Remove(f.Name()) }, nil
}

func repoRoot() string {
	_, this, _, _ := runtime.Caller(0)
	return filepath.Dir(filepath.Dir(filepath.Dir(this)))
}
