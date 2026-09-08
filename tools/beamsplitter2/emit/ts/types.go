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

package ts

import (
	"fmt"
	"strings"

	"beamsplitter2/emit/js"
	"beamsplitter2/ir"
)

// Names come from the embind emitter rather than being worked out again here: a
// declaration that names a type differently from its registration describes a
// class that is not there, and the two spellings have already drifted once.
//
// This file is the whole of what TypeScript knows about a C++ type. It is the
// counterpart of js.Target: the embind emitter decides what can cross the
// boundary, and this decides what to call it once it has.
//
// Nothing here rejects anything. The declarations describe bindings that already
// exist, so by the time a type reaches this file the rules have agreed it can be
// carried, and every case below must produce a name.

// tsType is the TypeScript spelling of a bound C++ type.
func tsType(names js.Names, t *ir.Type) string {
	switch t.Kind {
	case ir.KindVoid:
		return "void"
	case ir.KindBool:
		return "boolean"
	case ir.KindString:
		return "string"

	case ir.KindVector, ir.KindQuat:
		// Registered with embind as a value_array, which reaches JavaScript as a
		// plain array. The aliases naming those -- float3, quatf -- are declared once
		// in the hand-written preamble, so this only has to pick the right one.
		return mathName(t)

	case ir.KindMatrix:
		// The bindings flatten a matrix into flatmat3/flatmat4, and both arrive as a
		// flat array of numbers.
		if t.Rows == 3 && t.Cols == 3 {
			return "mat3"
		}
		return "mat4"

	case ir.KindBuffer:
		// The two descriptors are declared by hand, under the names the JavaScript
		// helpers have always used.
		if strings.Contains(t.Canonical, "PixelBufferDescriptor") {
			return "driver$PixelBufferDescriptor"
		}
		return "driver$BufferDescriptor"

	case ir.KindEnum, ir.KindClass, ir.KindStruct:
		if t.Target != "" {
			return names.Of(t.Target)
		}
		return "any"
	}

	// Everything left is a number: JavaScript has one numeric type, and the rules
	// already refused the integers too wide to fit in it.
	return "number"
}

// mathName is the alias a vector or quaternion is declared under: float3,
// double2, quatf. These match both the value_array registrations and the aliases
// the preamble already exports.
func mathName(t *ir.Type) string {
	scalar := map[ir.Kind]string{
		ir.KindF32: "float", ir.KindF64: "double",
		ir.KindI32: "int", ir.KindU32: "uint", ir.KindBool: "bool",
	}[t.Scalar]
	if scalar == "" {
		scalar = "float"
	}
	if t.Kind == ir.KindQuat {
		return "quat" + scalar[:1]
	}
	return fmt.Sprintf("%s%d", scalar, t.Rows)
}

// reserved cannot be used as a parameter name in a declaration file.
var reserved = map[string]bool{
	"function": true, "default": true, "new": true, "class": true,
	"var": true, "let": true, "const": true, "in": true, "of": true,
	"typeof": true, "instanceof": true, "delete": true, "void": true,
}

// paramName is the name a parameter is declared under. C++ allows an unnamed
// parameter and TypeScript does not, so one is invented from its position.
func paramName(p *ir.Param, index int) string {
	name := p.Name
	if name == "" {
		return fmt.Sprintf("arg%d", index)
	}
	if reserved[name] {
		return name + "_"
	}
	return name
}

// signature renders a parameter list. A parameter with a C++ default becomes an
// optional one, which is what makes the declarations usable: nearly every
// Filament call relies on trailing defaults.
func signature(names js.Names, m *ir.Method) string {
	parts := make([]string, 0, len(m.Params))
	for i, p := range m.Params {
		optional := ""
		if p.Default != "" {
			optional = "?"
		}
		parts = append(parts, fmt.Sprintf("%s%s: %s", paramName(p, i), optional, tsType(names, p.Type)))
	}
	return strings.Join(parts, ", ")
}
