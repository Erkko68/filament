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
	"testing"

	"beamsplitter2/clang"
	"beamsplitter2/emit/js"
	"beamsplitter2/ir"
	"beamsplitter2/rules"
)

// parseFixture runs the real pipeline over testdata/fixture.h. It needs clang++
// but not the Filament sources, so it is fast and independent of the engine.
func parseFixture(t *testing.T) *ir.API {
	t.Helper()
	ast, err := clang.DumpAST(clang.DumpOptions{HeaderPath: "testdata/fixture.h"})
	if err != nil {
		t.Fatalf("dumping fixture AST: %v", err)
	}
	api := ir.Parse(ast, []string{"testdata/fixture.h"}, nil, nil)
	rules.Apply(api, js.Target{})
	return api
}

func class(t *testing.T, api *ir.API, name string) *ir.Class {
	t.Helper()
	c := api.Class(name)
	if c == nil {
		t.Fatalf("class %s not found", name)
	}
	return c
}

func method(t *testing.T, c *ir.Class, name string) *ir.Method {
	t.Helper()
	for _, m := range c.Methods {
		if m.Name == name {
			return m
		}
	}
	t.Fatalf("%s has no method %s", c.CppName, name)
	return nil
}

// TestTypes is the important one: it pins down that types are read from clang's
// structured tree rather than guessed from spelling. A regression here silently
// corrupts every binding downstream.
func TestTypes(t *testing.T) {
	api := parseFixture(t)
	w := class(t, api, "fx::Widget")

	for _, tc := range []struct {
		method string
		param  int
		kind   ir.Kind
		rows   int
		cols   int
		scalar ir.Kind
	}{
		// float3 reaches TVec3<float> only through the vec3 alias template.
		{"lookAt", 0, ir.KindVector, 3, 0, ir.KindF32},
		{"setTransform", 0, ir.KindMatrix, 4, 4, ir.KindF64},
		{"setSmallTransform", 0, ir.KindMatrix, 3, 3, ir.KindF32},
		{"setOrientation", 0, ir.KindQuat, 4, 0, ir.KindF32},
		{"setViewport", 0, ir.KindStruct, 0, 0, ""},
		{"setName", 0, ir.KindString, 0, 0, ""},
		{"setMode", 0, ir.KindEnum, 0, 0, ""},
		{"onDone", 0, ir.KindCallback, 0, 0, ""},
		{"setOpaque", 0, ir.KindVoid, 0, 0, ""},
	} {
		got := method(t, w, tc.method).Params[tc.param].Type
		if got.Kind != tc.kind {
			t.Errorf("%s param %d: kind = %q, want %q (cpp %q)", tc.method, tc.param, got.Kind, tc.kind, got.Cpp)
		}
		if got.Rows != tc.rows || got.Cols != tc.cols {
			t.Errorf("%s param %d: dims = %dx%d, want %dx%d", tc.method, tc.param, got.Rows, got.Cols, tc.rows, tc.cols)
		}
		if tc.scalar != "" && got.Scalar != tc.scalar {
			t.Errorf("%s param %d: scalar = %q, want %q", tc.method, tc.param, got.Scalar, tc.scalar)
		}
	}

	// Enums must resolve to their declaration, not merely be categorised.
	if got := method(t, w, "setMode").Params[0].Type.Target; got != "fx::Mode" {
		t.Errorf("setMode target = %q, want fx::Mode", got)
	}
}

// TestScopeLookup guards the C++ rule that an unqualified name is looked up in the
// enclosing scopes first. Without it "Builder" resolves to whichever Builder was
// parsed first, and every fluent method is misattributed.
func TestScopeLookup(t *testing.T) {
	api := parseFixture(t)
	builder := class(t, api, "fx::Widget::Builder")

	got := method(t, builder, "width").Return
	if got.Target != "fx::Widget::Builder" {
		t.Errorf("Builder::width returns %q, want fx::Widget::Builder", got.Target)
	}
	if got.Indirection != ir.Reference {
		t.Errorf("Builder::width indirection = %q, want ref", got.Indirection)
	}
}

func TestDecisions(t *testing.T) {
	api := parseFixture(t)
	w := class(t, api, "fx::Widget")

	for _, tc := range []struct {
		method string
		bind   bool
		rule   string
	}{
		{"lookAt", true, "bindable"},
		{"setName", true, "bindable"},
		{"setBuffer", false, "rvalue-ref-param"},
		{"onDone", false, "callback"},
		{"setOpaque", false, "opaque-pointer"},
		{"operator=", false, "operator"},
		{"internalOnly", false, "non-public"},
	} {
		m := method(t, w, tc.method)
		if m.Bind != tc.bind || m.Rule != tc.rule {
			t.Errorf("%s: bind=%v rule=%q, want bind=%v rule=%q (reason %q)",
				tc.method, m.Bind, m.Rule, tc.bind, tc.rule, m.Reason)
		}
		// Every verdict must be attributable and explained.
		if m.Rule == "" || m.Reason == "" {
			t.Errorf("%s: decision is not attributable (rule=%q reason=%q)", tc.method, m.Rule, m.Reason)
		}
	}

	// A class template cannot be bound, and must say so rather than vanish.
	holder := class(t, api, "fx::Holder")
	if holder.Bind || holder.Rule != "class-template" {
		t.Errorf("Holder: bind=%v rule=%q, want bind=false rule=class-template", holder.Bind, holder.Rule)
	}

	// A move constructor is not a binding candidate.
	buffer := class(t, api, "fx::Buffer")
	moved := false
	for _, ctor := range buffer.Constructors {
		if ctor.Rule == "copy-or-move" {
			moved = true
		}
	}
	if !moved {
		t.Error("Buffer: move constructor was not recognised")
	}
}

func TestOverloads(t *testing.T) {
	api := parseFixture(t)
	w := class(t, api, "fx::Widget")

	for _, m := range w.Methods {
		if m.Name == "resize" && !m.Overloaded {
			t.Error("resize should be marked overloaded")
		}
		if m.Name == "resize" && m.Signature == "" {
			t.Error("resize needs a signature to disambiguate the overloads")
		}
	}

}

func TestDocs(t *testing.T) {
	api := parseFixture(t)
	lookAt := method(t, class(t, api, "fx::Widget"), "lookAt")

	if lookAt.Doc == nil {
		t.Fatal("lookAt lost its documentation")
	}
	if lookAt.Doc.Params["eye"] == "" {
		t.Errorf("@param eye was not captured: %+v", lookAt.Doc)
	}
	if lookAt.Params[0].Doc == "" {
		t.Error("parameter doc was not attached to the parameter")
	}
}

// TestClangFailsLoudly checks that a header clang cannot compile is reported
// rather than yielding a silently truncated AST.
func TestClangFailsLoudly(t *testing.T) {
	if _, err := clang.DumpAST(clang.DumpOptions{HeaderPath: "testdata/does_not_exist.h"}); err == nil {
		t.Error("expected an error for a missing header, got nil")
	}
}
