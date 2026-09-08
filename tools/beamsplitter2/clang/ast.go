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

// Package clang runs clang++ over a header and decodes the part of its JSON AST
// that beamsplitter reads.
//
// The types below are decode targets only -- nothing marshals them back -- so the
// json tags carry no options, and a field is here because something in the tool
// reads it. Clang emits far more than this; a field joins the struct when a
// reader for it appears, not before.
package clang

import (
	"fmt"
	"strconv"
)

// Loc is a source location. Clang omits file and line when they repeat the
// previous node's, so a node with a real location can still arrive with both
// missing; the parser carries the last file it saw forward.
type Loc struct {
	File string `json:"file"`
	Line int    `json:"line"`
}

// Range is a source range. Only the start is read, as the stand-in for loc on
// nodes that carry a range but no loc of their own.
type Range struct {
	Begin *Loc `json:"begin"`
}

// TypeRef is a type as clang spells it: as written, and again with every typedef
// and alias resolved.
type TypeRef struct {
	QualType          string `json:"qualType"`
	DesugaredQualType string `json:"desugaredQualType"`
}

// DeclRef is the declaration an expression names. A DeclRefExpr carries no name
// of its own, so this is the only place the enum constant behind a default value
// can be read from.
type DeclRef struct {
	Name string `json:"name"`
}

// Node is one node of clang's JSON AST. A single struct covers every node kind
// because the JSON is untyped: one "inner" array holds declarations, types and
// comments alike, and Kind is what says which of the fields below mean anything.
type Node struct {
	Kind  string   `json:"kind"`
	Name  string   `json:"name"`
	Inner []*Node  `json:"inner"`
	Loc   *Loc     `json:"loc"`
	Range *Range   `json:"range"`
	Type  *TypeRef `json:"type"`

	// Declarations.
	TagUsed            string `json:"tagUsed"` // "class", "struct" or "union", as written
	CompleteDefinition bool   `json:"completeDefinition"`
	Access             string `json:"access"`
	StorageClass       string `json:"storageClass"`
	Virtual            bool   `json:"virtual"`
	Pure               bool   `json:"pure"`
	IsImplicit         bool   `json:"isImplicit"`
	IsBitfield         bool   `json:"isBitfield"`
	ExplicitlyDeleted  bool   `json:"explicitlyDeleted"`
	// FixedUnderlyingType is the ": uint8_t" of a scoped enum; an EnumDecl carries
	// no "type" of its own.
	FixedUnderlyingType *TypeRef `json:"fixedUnderlyingType"`
	// Init marks a parameter as having a default argument, and names the syntax it
	// was written with. The argument itself is the parameter's inner node.
	Init string `json:"init"`
	// HasInClassInitializer is the same fact about a data member, which clang
	// reports as a flag rather than a spelling. The expression is the member's
	// inner node either way.
	HasInClassInitializer bool     `json:"hasInClassInitializer"`
	ReferencedDecl        *DeclRef `json:"referencedDecl"`
	// Opcode is the operator a UnaryOperator applies. The sign of a negative
	// literal lives here rather than in the literal underneath.
	Opcode string `json:"opcode"`
	// Value holds an enum constant or a literal. Clang writes most of them as JSON
	// strings but some (character literals, template arguments) as JSON numbers,
	// which is why this is untyped and why ValueString exists.
	Value interface{} `json:"value"`

	// Doxygen comments.
	Text  string `json:"text"`
	Param string `json:"param"` // the parameter a \param block documents
	// Args and RenderKind belong to an InlineCommandComment: "\p near" arrives as
	// name "p" with args ["near"], and the name it refers to is only in the args.
	Args       []string `json:"args"`
	RenderKind string   `json:"renderKind"`
}

// ValueString returns Value as the C++ source would have spelled it.
func (n *Node) ValueString() string {
	if n == nil || n.Value == nil {
		return ""
	}
	// Only numbers need care: encoding/json hands them over as float64, and %v
	// would then print 1000000 as 1e+06.
	if f, ok := n.Value.(float64); ok {
		return strconv.FormatFloat(f, 'f', -1, 64)
	}
	return fmt.Sprintf("%v", n.Value)
}

// File returns the source file for this node, falling back to the start of its
// range when loc has none.
func (n *Node) File() string {
	if n.Loc != nil && n.Loc.File != "" {
		return n.Loc.File
	}
	if n.Range != nil && n.Range.Begin != nil && n.Range.Begin.File != "" {
		return n.Range.Begin.File
	}
	return ""
}

// Line returns the source line for this node, falling back to the start of its
// range. Zero means clang elided the line as a repeat of the previous node's;
// nothing but diagnostics reads it, so no line is carried forward.
func (n *Node) Line() int {
	if n.Loc != nil && n.Loc.Line > 0 {
		return n.Loc.Line
	}
	if n.Range != nil && n.Range.Begin != nil && n.Range.Begin.Line > 0 {
		return n.Range.Begin.Line
	}
	return 0
}
