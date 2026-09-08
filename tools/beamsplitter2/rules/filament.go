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

// Filament-specific knowledge: things no parser could derive and no target could
// guess, because they are conventions of this particular codebase. Every other
// file is either the C++ language or a question for the Target.
//
// This is the only part of the tool that a new Filament type can require a change
// to, and it is a table, not code.
//
// ponytail: a table, because five entries do not justify a mechanism. If Filament
// starts adding these often, the upgrade is annotations in the headers --
// __attribute__((annotate("beamsplitter:buffer"))) behind a macro, which clang
// carries into the AST -- so the knowledge lives beside the declaration and this
// file disappears.

package rules

import (
	"strings"

	"beamsplitter2/ir"
)

//
// ponytail: a table, because five entries do not justify a mechanism. If Filament
// starts adding these often, the upgrade is annotations in the headers --
// __attribute__((annotate("beamsplitter:buffer"))) behind a macro, which clang
// carries into the AST -- so the knowledge lives beside the declaration and this
// block disappears.
// ---------------------------------------------------------------------------

// Specializations are the class templates this API only ever uses at one type,
// and what that type is.
//
// A template cannot be bound, only a concrete instantiation of one, and the
// headers instantiate none: camutils::Manipulator<FLOAT> is written out in full
// and used at float everywhere. Nothing in the AST says so -- clang has no
// instantiation to show, since nothing in the headers asks for one -- so it is
// said here, and the parameter resolves like any other name in the class's
// scope.
//
// The key is the qualified name of the template; the value maps each parameter
// to what to read it as.
var Specializations = map[string]map[string]string{
	"filament::camutils::Manipulator": {"FLOAT": "float"},
	"filament::camutils::Bookmark":    {"FLOAT": "float"},
}

// Instantiations are the member templates this API is used through, and the
// types it is used at.
//
// MaterialInstance::setParameter is a template over every type a material
// parameter can be, guarded by a trait. A template is not a function: nothing
// can be bound to it, and clang has no instantiation to show because the header
// asks for none. So the list is here, and each entry becomes one ordinary
// overload -- which the collision rule then names after the type it takes,
// giving setParameterFloat3 without being told.
var Instantiations = map[string][]string{
	"filament::MaterialInstance::setParameter": {
		"bool", "int32_t", "uint32_t", "float",
		"filament::math::float2", "filament::math::float3", "filament::math::float4",
		"filament::math::mat3f", "filament::math::mat4f",
	},
	"filament::Material::setDefaultParameter": {
		"bool", "int32_t", "uint32_t", "float",
		"filament::math::float2", "filament::math::float3", "filament::math::float4",
		"filament::math::mat3f", "filament::math::mat4f",
	},
}

// KnownTypes are the Filament types the IR gives a category of their own. They are
// ordinary C++ classes, so nothing in the parser could know what they mean.
//
// The key is matched against the type's canonical name, anywhere in it, which is
// why there is no entry for Callback: it would also claim CallbackHandler, which
// is an abstract class a caller implements and passes the address of. The
// typedefs it was meant for -- Texture::Callback and the rest -- desugar to
// function pointers, and the typemap recognises those by shape already.
var KnownTypes = []struct {
	Match string
	Kind  ir.Kind
}{
	// An EntityInstance is a uint32_t index wearing a class, with implicit
	// conversions both ways, so the boundary can carry the index and let C++ put the
	// wrapper back. Without this the class template rule rejects it and takes the
	// whole of RenderableManager, LightManager and TransformManager with it.
	{"EntityInstance", ir.KindU32},

	{"BufferDescriptor", ir.KindBuffer},
	{"PixelBufferDescriptor", ir.KindBuffer},
	{"Invocable", ir.KindCallback},
	{"std::function", ir.KindCallback},
}

// relabelKnownTypes applies KnownTypes to every type in the API.
func relabelKnownTypes(api *ir.API) {
	relabel := func(t *ir.Type) {
		if t == nil {
			return
		}
		name := t.Canonical
		if name == "" {
			name = t.Cpp
		}
		for _, known := range KnownTypes {
			if strings.Contains(name, known.Match) {
				t.Kind = known.Kind
				return
			}
		}
	}
	for _, c := range api.Classes {
		for _, f := range c.Fields {
			relabel(f.Type)
		}
		for _, m := range c.AllMethods() {
			relabel(m.Return)
			for _, p := range m.Params {
				relabel(p.Type)
			}
		}
	}
}
