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
	"strings"

	"beamsplitter2/clang"
)

// parseDoc reads the Doxygen comment attached to a declaration.
//
// Comments arrive as their own little tree of comment nodes under the declaration
// they document, and reading them shares nothing with reading declarations, which
// is why they are parsed here rather than in parse.go.
func parseDoc(n *clang.Node) *Doc {
	if n == nil {
		return nil
	}
	var full *clang.Node
	if n.Kind == "FullComment" {
		full = n
	} else {
		for _, child := range n.Inner {
			if child.Kind == "FullComment" {
				full = child
				break
			}
		}
	}
	if full == nil {
		return nil
	}

	doc := &Doc{Params: map[string]string{}}
	var paragraphs []string

	for _, child := range full.Inner {
		text := strings.TrimSpace(commentText(child))
		switch child.Kind {
		case "ParagraphComment":
			if text != "" {
				paragraphs = append(paragraphs, text)
			}
		case "ParamCommandComment":
			if child.Param != "" {
				doc.Params[child.Param] = text
			}
		case "BlockCommandComment":
			switch child.Name {
			case "return", "returns":
				doc.Returns = text
			case "see":
				doc.See = appendNonEmpty(doc.See, text)
			case "note":
				doc.Notes = appendNonEmpty(doc.Notes, text)
			case "warning":
				doc.Warnings = appendNonEmpty(doc.Warnings, text)
			case "deprecated":
				doc.Deprecated = text
			}
		}
	}

	if len(paragraphs) > 0 {
		doc.Brief = paragraphs[0]
		doc.Description = strings.Join(paragraphs, "\n\n")
	}
	if len(doc.Params) == 0 {
		doc.Params = nil
	}
	if doc.Brief == "" && doc.Returns == "" && doc.Params == nil &&
		len(doc.See) == 0 && len(doc.Notes) == 0 && len(doc.Warnings) == 0 && doc.Deprecated == "" {
		return nil
	}
	return doc
}

func commentText(n *clang.Node) string {
	if n == nil {
		return ""
	}
	var sb strings.Builder
	switch n.Kind {
	case "TextComment", "VerbatimBlockLineComment":
		sb.WriteString(n.Text)
	case "InlineCommandComment":
		// The word a command refers to lives in its args, not in any TextComment, so
		// dropping the node drops the word: "\p near > 0" becomes " > 0".
		text := strings.Join(n.Args, " ")
		if n.RenderKind == "monospaced" && text != "" {
			text = "`" + text + "`"
		}
		sb.WriteString(text)
	}
	for _, child := range n.Inner {
		text := commentText(child)
		if text == "" {
			continue
		}
		if sb.Len() > 0 && !strings.HasSuffix(sb.String(), " ") && !strings.HasPrefix(text, " ") {
			sb.WriteString(" ")
		}
		sb.WriteString(text)
	}
	return sb.String()
}

func appendNonEmpty(list []string, value string) []string {
	if value == "" {
		return list
	}
	return append(list, value)
}
