// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, SceneDiagnostic, SceneDocument, SceneEdit } from '@cratis/scene.model';
import { applyEdit, EditingContext, EditOutcome, indexDocument } from '../../index';
import { deepFreeze } from '../../given/a_layout_document';

/** Applies an edit to a deeply frozen document, so a mutation of the original throws. */
export function apply(document: SceneDocument, edit: SceneEdit, context: EditingContext): EditOutcome {
    return applyEdit(deepFreeze(structuredClone(document)), edit, context);
}

export function codesOf(outcome: EditOutcome): DiagnosticCode[] {
    return outcome.diagnostics.map((diagnostic: SceneDiagnostic) => diagnostic.code as DiagnosticCode);
}

export function ids(document: SceneDocument, ...nodeIds: string[]): string[] {
    const index = indexDocument(document);
    return nodeIds.map(nodeId => index.nodes.has(nodeId) ? nodeId : `(missing ${nodeId})`);
}

/** The element ids in a list of elements. */
export function elementIds(elements: unknown[]): string[] {
    return elements.map(element => (element as { id?: string; content?: { id: string } }).id ?? (element as { content: { id: string } }).content.id);
}
