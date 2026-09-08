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
	"sort"
	"strings"

	"beamsplitter2/ir"
)

// explainClass prints why each member of a class was or was not bound.
// A class is looked for in every target, not just the first: the same header is
// parsed once per target and reaches a different verdict in each, which is the
// question -explain is usually being asked.
func explainClass(all []*ir.API, name string) error {
	var matches []*ir.Class
	var names []string
	for _, api := range all {
		for _, c := range api.Classes {
			names = append(names, c.CppName)
			if c.Name == name || c.CppName == name {
				matches = append(matches, c)
			}
		}
	}
	if len(matches) == 0 {
		sort.Strings(names)
		return fmt.Errorf("no class named %q; known classes:\n  %s", name, strings.Join(names, "\n  "))
	}

	for _, c := range matches {
		fmt.Printf("%s  (%s:%d)\n", c.CppName, c.Header, c.Line)
		fmt.Printf("  %s  [%s] %s\n\n", verdict(c.Bind), c.Rule, c.Reason)
		for _, m := range append(append([]*ir.Method{}, c.Constructors...), c.Methods...) {
			fmt.Printf("  %s %-34s [%s] %s\n", verdict(m.Bind), m.Name+m.Signature, m.Rule, m.Reason)
		}
		fmt.Println()
	}
	return nil
}

func verdict(bind bool) string {
	if bind {
		return "BIND "
	}
	return "SKIP "
}
