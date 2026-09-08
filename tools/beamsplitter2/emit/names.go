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

package emit

import (
	"sort"
	"strings"
)

// Disambiguate resolves the names two declarations would otherwise share.
//
// Every emitter drops the namespaces from a C++ name, because a target language
// has its own way of saying where a thing lives -- a Java package, an embind
// registration. Dropping them can make two declarations one name, and both
// targets fail quietly when it does: embind throws at module load, and a Java
// file simply overwrites the one written before it.
//
// So the short name is kept where it is unambiguous, and where it is not, the
// declaration nearest the root keeps it and the others take back as much of
// their namespace as it takes to be told apart.
//
// sep joins the namespace back on. It is the caller's because it must not be
// the one that already means nesting: Java reads a dot as a package and would
// read Viewport$backend as a nested class, so there it is an underscore while
// nesting stays a dollar.
func Disambiguate(short map[string]string, sep string) map[string]string {
	taken := map[string][]string{}
	for cppName, name := range short {
		taken[name] = append(taken[name], cppName)
	}

	out := make(map[string]string, len(short))
	for name, cppNames := range taken {
		if len(cppNames) == 1 {
			out[cppNames[0]] = name
			continue
		}
		// Shallowest first, so the one a reader would expect to be called this keeps
		// the name. Ties are broken by the name itself, so a run is repeatable.
		sort.Slice(cppNames, func(i, j int) bool {
			di, dj := strings.Count(cppNames[i], "::"), strings.Count(cppNames[j], "::")
			if di != dj {
				return di < dj
			}
			return cppNames[i] < cppNames[j]
		})
		for i, cppName := range cppNames {
			out[cppName] = name
			if i > 0 {
				out[cppName] = qualify(cppName, name, i, sep)
			}
		}
	}
	return out
}

// qualify puts n namespace segments back in front of a name, joined the way
// nesting already is.
func qualify(cppName, name string, n int, sep string) string {
	segments := strings.Split(cppName, "::")
	// Everything before the declaration itself is namespace or enclosing class.
	prefix := segments[:len(segments)-strings.Count(name, "$")-1]
	if n > len(prefix) {
		n = len(prefix)
	}
	return strings.Join(append(prefix[len(prefix)-n:], name), sep)
}
