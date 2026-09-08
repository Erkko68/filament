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

package clang

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os/exec"
	"strings"
)

// cppStandard matches CXX_STANDARD in the top-level CMakeLists. Parsing at a
// lower standard than the build uses would reject headers the build accepts.
const cppStandard = "c++20"

// DumpOptions configures the invocation of clang++ -ast-dump=json.
type DumpOptions struct {
	HeaderPath  string
	IncludeDirs []string
}

// DumpAST runs clang++ with -ast-dump=json and parses the resulting AST into a Node tree.
func DumpAST(opts DumpOptions) (*Node, error) {
	// The JSON dumper already puts a structured type tree, with decl
	// cross-references, under every type declaration; -ast-dump-decl-types changes
	// only the textual dump and is deliberately not passed.
	//
	// -x c++-header says outright what clang would otherwise infer from the .h
	// suffix, which it does with a deprecation warning.
	args := []string{
		"-Xclang", "-ast-dump=json",
		"-fsyntax-only",
		"-std=" + cppStandard,
		"-x", "c++-header",
	}

	for _, inc := range opts.IncludeDirs {
		args = append(args, "-I", inc)
	}

	args = append(args, opts.HeaderPath)

	cmd := exec.Command("clang++", args...)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	// Decoded off a pipe rather than collected with cmd.Output: one public header
	// expands to hundreds of megabytes of JSON, and only a fraction of it is kept.
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to open stdout pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start clang++: %w", err)
	}

	var root Node
	decodeErr := json.NewDecoder(stdout).Decode(&root)

	// Drain the rest of stdout so clang never blocks writing into a full pipe.
	_, _ = io.Copy(io.Discard, stdout)

	// A non-zero exit means clang hit a real error, in which case the AST above is
	// truncated and every downstream conclusion drawn from it is wrong. Warnings do
	// not affect the exit code, so this only fires on genuine failures. It is also
	// the better error to report: a truncated dump fails to decode as well, and the
	// decode error would say nothing about the cause.
	if waitErr := cmd.Wait(); waitErr != nil {
		return nil, fmt.Errorf("clang++ failed on %s: %w\n%s",
			opts.HeaderPath, waitErr, firstLines(stderr.String(), 20))
	}
	if decodeErr != nil {
		return nil, fmt.Errorf("failed to decode clang AST JSON for %s: %w", opts.HeaderPath, decodeErr)
	}

	return &root, nil
}

// firstLines keeps the head of clang's diagnostics, where the first error -- the
// one that caused the rest -- is.
func firstLines(s string, n int) string {
	lines := strings.Split(s, "\n")
	if len(lines) <= n {
		return s
	}
	return strings.Join(lines[:n], "\n") + fmt.Sprintf("\n... (%d more lines)", len(lines)-n)
}
