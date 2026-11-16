// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { applyEdit, type EditingContext } from '@cratis/scene.engine';
import { SceneEditKind, type SceneDocument, type SceneEdit } from '@cratis/scene.model';
import { authoredRoot } from '../Document/studioScreen';
import type { ScreenEditorRuntime } from '../Runtime/screenEditorRuntime';
import type { SceneScreenDraftPreparation } from './SceneScreenDraft';
import { readDraftEnvelope } from './sceneScreenDraftEnvelope';
import { insertEdit } from './sceneScreenDraftInsertion';
import { propertyEdit } from './sceneScreenDraftProperty';
import type { DraftState } from './sceneScreenDraftState';
import { checkTree, collectIdentities, isRecord } from './sceneScreenDraftValues';

// What a preparation is judged against; the same grouping the live editing session holds.
export interface SceneScreenDraftScope {
    runtime: ScreenEditorRuntime;
    context: EditingContext;
    parameterlessQueryIds: readonly string[];
}

const isScreenScope = (context: EditingContext) => context.scope.kind === 'screen' && context.scope.name === 'Screen';

function nextEdit(raw: unknown, state: DraftState, scope: SceneScreenDraftScope): SceneEdit {
    if (!isRecord(raw)) throw new Error('Every edit must be an object.');
    if (raw.kind === SceneEditKind.InsertNode) return insertEdit(raw, state, scope.runtime);
    if (raw.kind === SceneEditKind.SetProperty) return propertyEdit(raw, state, scope.context);
    throw new Error('This edit kind is not supported by additive drafts.');
}

function applyAll(base: SceneDocument, rawEdits: unknown[], scope: SceneScreenDraftScope) {
    const state: DraftState = { document: base, used: collectIdentities(base), added: new Set<string>() };
    const edits: SceneEdit[] = [];
    for (const raw of rawEdits) {
        const edit = nextEdit(raw, state, scope);
        const outcome = applyEdit(state.document, edit, scope.context);
        if (!outcome.applied) throw new Error('Scene refused an edit in this proposal.');
        state.document = outcome.model;
        edits.push(edit);
    }
    return { document: state.document, edits };
}

function problemOf(error: unknown): string {
    if (error instanceof SyntaxError) return 'The provider did not return readable draft JSON.';
    return error instanceof Error ? error.message : 'The proposal could not be validated.';
}

// All checks run against private immutable candidates; a late failure returns no edits or candidate.
export function prepareSceneScreenDraft(base: SceneDocument, answer: string, scope: SceneScreenDraftScope): SceneScreenDraftPreparation {
    try {
        if (answer.length > 1_000_000) throw new Error('The proposal is too large.');
        const parsed: unknown = JSON.parse(answer);
        checkTree(parsed);
        const envelope = readDraftEnvelope(parsed);
        if (!authoredRoot(base) || !isScreenScope(scope.context)) throw new Error('Drafts are available only for an authored screen.');
        const { document, edits } = applyAll(base, envelope.edits, scope);
        return { prepared: { base, document, answer, reply: envelope.reply, edits, parameterlessQueryIds: [...scope.parameterlessQueryIds], runtime: scope.runtime, context: scope.context } };
    } catch (error) {
        return { problem: problemOf(error) };
    }
}
