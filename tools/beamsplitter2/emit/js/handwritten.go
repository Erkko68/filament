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
	"fmt"
	"os"
	"regexp"
	"strings"

	"beamsplitter2/ir"
)

// The handwritten section is the escape hatch, and it is the reason the rules can
// afford to refuse anything they cannot bind correctly: whatever they refuse is
// listed here as a to-do, and whatever a developer writes below that survives the
// next run untouched.

const handwrittenMarker = "// HANDWRITTEN SECTION"

const bindingsEnd = "} // EMSCRIPTEN_BINDINGS"

// handwritten builds the section for one file: the to-do list, plus the developer's
// own bindings recovered from the file this run is about to overwrite.
func handwritten(classes []*ir.Class, path string) *handwrittenView {
	previous := readHandwritten(path)
	// Anything already bound below needs no second mention: the list is a to-do,
	// and a member that is written is done.
	done := handwrittenNames(previous)

	var missing []string
	for _, c := range classes {
		for _, m := range append(append([]*ir.Method{}, c.Constructors...), c.Methods...) {
			if skipSilently(m) || done[m.Name] {
				continue
			}
			missing = append(missing, fmt.Sprintf("%s::%s%s: %s", c.Name, m.Name, m.Signature, m.Reason))
		}
	}
	return &handwrittenView{Missing: missing, Previous: previous}
}

// skipSilently reports a method not worth listing: one that is bound, or that no
// one would hand-write anyway. A const twin is already bound through its
// non-const half, and the rest have no cross-language meaning at all.
func skipSilently(m *ir.Method) bool {
	switch {
	case m.Bind, m.Rule == "non-public", m.Rule == "operator",
		m.Rule == "copy-or-move", m.Rule == "const-twin":
		return true
	}
	return false
}

// handwrittenName matches a member registration, which is how the section says
// what it has already bound.
var handwrittenName = regexp.MustCompile(`\.(?:class_function|function|property|class_property)\("([^"]+)"`)

func handwrittenNames(previous string) map[string]bool {
	names := map[string]bool{}
	for _, m := range handwrittenName.FindAllStringSubmatch(previous, -1) {
		names[m[1]] = true
	}
	return names
}

// generatedComment reports a line this generator wrote into the section last time.
// Those are replaced on every run; everything else is the developer's and is kept.
var generatedComment = regexp.MustCompile(`^(` + regexp.QuoteMeta(handwrittenMarker) +
	`|//   - |// The following could not be generated|// Everything on this class was generated` +
	`|// Anything added below|// block is preserved|// ====)`)

// readHandwritten recovers the developer's own bindings from a previously
// generated file: everything between the marker and the closing brace, minus the
// comment block the generator itself wrote there.
func readHandwritten(path string) string {
	content, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	text := string(content)

	start := strings.Index(text, handwrittenMarker)
	end := strings.LastIndex(text, bindingsEnd)
	if start < 0 || end < start {
		return ""
	}

	var kept []string
	for _, line := range strings.Split(text[start:end], "\n") {
		if !generatedComment.MatchString(strings.TrimSpace(line)) {
			kept = append(kept, line)
		}
	}
	return strings.TrimSpace(strings.Join(kept, "\n"))
}
