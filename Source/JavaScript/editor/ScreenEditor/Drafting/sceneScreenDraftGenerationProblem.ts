// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneScreenDraftRefusal } from './SceneScreenDraft';
import type { SceneScreenDraftStrings } from './SceneScreenDraftStrings';

// Only a refusal carries text meant for the person; any other error stays generic so internals are never shown.
export const sceneScreenDraftGenerationProblem = (error: unknown, text: SceneScreenDraftStrings) =>
    error instanceof SceneScreenDraftRefusal && error.message ? error.message : text.generationFailed;
