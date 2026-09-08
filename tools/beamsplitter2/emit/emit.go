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

// Package emit holds what every binding emitter needs from the build layout,
// which is only this: how the headers are grouped into output directories.
package emit

// Module is one output directory of bindings. Which module a declaration lands
// in is decided by the header it came from: within a binary a type must be
// registered exactly once, or the registrations collide when the module loads.
//
// It lives here rather than beside an emitter because the grouping is a fact
// about Filament's libraries, the same for every target language.
type Module struct {
	Name    string
	Headers []string
}

// Owns reports whether this module is responsible for a declaration.
func (m Module) Owns(header string) bool {
	for _, h := range m.Headers {
		if h == header {
			return true
		}
	}
	return false
}
