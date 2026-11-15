// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { EditingContext } from '@cratis/scene.engine';
import type { SceneDocument, SceneEdit } from '@cratis/scene.model';
import type { ScreenEditorRuntime } from '../Runtime/screenEditorRuntime';

// A host supplies contracts and generation; the editor owns validation, review and history.
export interface SceneScreenDraftAgent {
    readonly context: string;
    readonly parameterlessQueryIds: readonly string[];
    generate(request: SceneScreenDraftRequest, signal: AbortSignal): Promise<string>;
}

export interface SceneScreenDraftRequest {
    instruction: string;
    catalogue: string;
    document: string;
}

export interface PreparedSceneScreenDraft {
    readonly base: SceneDocument;
    readonly document: SceneDocument;
    readonly answer: string;
    readonly reply: string;
    readonly edits: SceneEdit[];
    readonly parameterlessQueryIds: readonly string[];
    readonly runtime: ScreenEditorRuntime;
    readonly context: EditingContext;
}

export type SceneScreenDraftPreparation = { prepared: PreparedSceneScreenDraft; problem?: never } | { problem: string; prepared?: never };

// A host's refusal to draft, with a message written for the person; any other error from generate reads as a generic failure.
export class SceneScreenDraftRefusal extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SceneScreenDraftRefusal';
    }
}
