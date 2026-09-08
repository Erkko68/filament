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

package ir

import (
	"strconv"
	"strings"

	"beamsplitter2/clang"
)

// Reading C++ itself, as opposed to reading declarations. Clang hands over a
// function's type as one string and an initializer as a little tree, and this is
// everything that takes them apart: the only place in the tool that parses C++
// text by hand, kept together so that it stays the only one.

// isConstMethod reports a const member function. The qualifier sits before any
// exception specification, so "void () const noexcept" is const and a plain
// HasSuffix check would miss it -- as it would for most of Filament, which marks
// nearly everything noexcept.
func isConstMethod(functionType string) bool {
	tail := functionType
	if i := strings.LastIndex(tail, ")"); i >= 0 {
		tail = tail[i+1:]
	}
	for _, word := range strings.Fields(tail) {
		if word == "const" {
			return true
		}
	}
	return false
}

// returnOf slices the return type off a function type string: "void (int) const".
func returnOf(functionType string) string {
	if i := strings.Index(functionType, "("); i >= 0 {
		return strings.TrimSpace(functionType[:i])
	}
	return functionType
}

// paramsOf slices the parameter list out of a function type string, keeping the
// trailing const so const/non-const overloads stay distinguishable.
func paramsOf(functionType string) string {
	open := strings.Index(functionType, "(")
	closed := strings.LastIndex(functionType, ")")
	if open < 0 || closed < open {
		return ""
	}
	out := functionType[open : closed+1]
	if isConstMethod(functionType) {
		out += " const"
	}
	return out
}

func desugared(n *clang.Node) string {
	if n == nil || n.Type == nil {
		return ""
	}
	return n.Type.DesugaredQualType
}

func defaultValue(n *clang.Node) (string, bool) {
	if n == nil || n.Init == "" {
		return "", false
	}
	if v := literalOrName(n); v != "" {
		return v, true
	}
	return "default", true
}

// memberDefault is what a data member is initialised to where it is declared.
// Clang marks the member with a flag rather than a spelling, but hangs the
// expression underneath it the same way it does for a defaulted parameter, so
// the same reader finds it.
func memberDefault(n *clang.Node) (string, bool) {
	if n == nil {
		return "", false
	}
	// A static member is a VarDecl, and clang marks nothing on it: the initializer
	// is simply the expression underneath, the way it is for any variable. Only a
	// non-static member gets the flag.
	if !n.HasInClassInitializer && n.Kind != "VarDecl" {
		return "", false
	}
	if v := literalOrName(n); v != "" {
		return v, true
	}
	return "default", true
}

// literalOrName is the value an initializer was written with, or "" where it was
// written as something this cannot spell.
//
// It descends only through nodes that do not change the value. Searching the
// whole subtree for the first literal, which is what this used to do, answers
// "256" for "256 * 64" and "1.0" for "-1.0f": both wrong, and wrong in a way
// nothing downstream can detect.
func literalOrName(n *clang.Node) string {
	if n == nil {
		return ""
	}
	switch n.Kind {
	case "CXXNullPtrLiteralExpr":
		// A null pointer has no value node of its own; the kind is the whole of it.
		return "nullptr"

	case "DeclRefExpr":
		// The name of what is referred to, not of the reference. An enum constant
		// used as a default reaches here with nothing on the expression itself.
		if n.Name != "" {
			return n.Name
		}
		if n.ReferencedDecl != nil && n.ReferencedDecl.Name != "" {
			return n.ReferencedDecl.Name
		}
		return ""

	case "UnaryOperator":
		// The sign is part of the value and clang keeps it here, not in the literal
		// beneath: -1.0f is a minus applied to 1.0f.
		inner := literalOrName(firstExpr(n))
		switch {
		case inner == "":
			return ""
		case n.Opcode == "-":
			return "-" + inner
		case n.Opcode == "+":
			return inner
		}
		return ""
	}

	if v := n.ValueString(); v != "" {
		return v
	}
	if transparent[n.Kind] {
		return literalOrName(firstExpr(n))
	}
	return ""
}

// transparent are the nodes that stand between a declaration and the value it
// was given without changing what that value is. Anything else -- an arithmetic
// operator, a constructor call, a braced list -- is an expression this does not
// evaluate, and saying so is the point.
var transparent = map[string]bool{
	"FieldDecl":                true,
	"VarDecl":                  true,
	"ParmVarDecl":              true,
	"EnumConstantDecl":         true,
	"ConstantExpr":             true,
	"ImplicitCastExpr":         true,
	"CStyleCastExpr":           true,
	"CXXStaticCastExpr":        true,
	"CXXFunctionalCastExpr":    true,
	"ParenExpr":                true,
	"ExprWithCleanups":         true,
	"MaterializeTemporaryExpr": true,
	"CXXBindTemporaryExpr":     true,
}

// firstExpr is the first inner node that is part of the expression. A
// declaration also carries its documentation comment, which is not.
func firstExpr(n *clang.Node) *clang.Node {
	for _, child := range n.Inner {
		if !strings.HasSuffix(child.Kind, "Comment") {
			return child
		}
	}
	return nil
}

func enumValue(n *clang.Node) (int64, bool) {
	for _, child := range n.Inner {
		v := literalOrName(child)
		if v == "" {
			continue
		}
		if i, err := strconv.ParseInt(v, 0, 64); err == nil {
			return i, true
		}
		// An enum with a uint64 underlying type can name a value no int64 holds, and
		// falling through would silently hand back the previous value plus one. Keep
		// the bits, as C++ does when the same constant is read back as signed.
		if u, err := strconv.ParseUint(v, 0, 64); err == nil {
			return int64(u), true
		}
	}
	return 0, false
}
