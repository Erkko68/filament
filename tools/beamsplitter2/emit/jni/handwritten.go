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
	"regexp"
	"strings"

	"beamsplitter2/ir"
)

// The handwritten section is the escape hatch, and it is the reason the rules
// can afford to refuse anything they cannot bind correctly: whatever they refuse
// is listed here as a to-do, and whatever a developer writes below that survives
// the next run untouched.
//
// It is the end of the file rather than a block inside one, because a JNI
// binding is a free function: there is nothing for it to be inside.

const handwrittenMarker = "// HANDWRITTEN SECTION"

// handwritten builds the section for one file: the to-do list, plus the
// developer's own shims recovered from the file this run is about to overwrite.
func handwritten(pkg string, classes []*ir.Class, path string) *handwrittenView {
	previous := readHandwritten(path)

	var missing []string
	for _, c := range classes {
		for _, m := range c.AllMethods() {
			if m.Bind || skipSilently(m) || alreadyWritten(previous, m) {
				continue
			}
			missing = append(missing, fmt.Sprintf("%s::%s%s: %s", c.Name, m.Name, m.Signature, m.Reason))
		}
	}
	return &handwrittenView{Missing: missing, Previous: previous}
}

// alreadyWritten reports a method the section below has bound, which is a to-do
// that is done.
//
// ponytail: it looks for the Java name anywhere in the section rather than
// parsing the mangled symbol out of it. A mangled name is ambiguous to split --
// the escapes are what make it a valid identifier, not a delimiter -- and the
// cost of being wrong is one stale line in a comment.
func alreadyWritten(previous string, m *ir.Method) bool {
	return previous != "" && strings.Contains(previous, JavaName(m))
}

// skipSilently reports a method not worth listing: one no one would hand-write
// anyway. A const twin is already reachable through its non-const half, and the
// rest have no meaning on the Java side at all.
func skipSilently(m *ir.Method) bool {
	switch m.Rule {
	case "const-twin", "non-public", "operator", "deleted", "copy-or-move", "class-template":
		return true
	}
	return m.MethodKind == ir.Constructor
}

// generatedComment reports a line this generator wrote into the section last
// time. Those are replaced on every run; everything else is the developer's and
// is kept.
var generatedComment = regexp.MustCompile(`^(` + regexp.QuoteMeta(handwrittenMarker) +
	`|//   - |// The following could not be generated|// Everything on this class was generated` +
	`|// Anything added below|// block is preserved|// ====)`)

// readHandwritten recovers the developer's own shims from a previously generated
// file: everything past the marker, minus the comment block the generator itself
// wrote there.
func readHandwritten(path string) string {
	content, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	text := string(content)

	start := strings.Index(text, handwrittenMarker)
	if start < 0 {
		return ""
	}

	var kept []string
	for _, line := range strings.Split(text[start:], "\n") {
		if !generatedComment.MatchString(strings.TrimSpace(line)) {
			kept = append(kept, line)
		}
	}
	return strings.TrimSpace(strings.Join(kept, "\n"))
}
