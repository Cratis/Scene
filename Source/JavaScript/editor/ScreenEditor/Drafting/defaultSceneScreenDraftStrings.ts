// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneScreenDraftStrings } from './SceneScreenDraftStrings';

export const defaultSceneScreenDraftStrings: SceneScreenDraftStrings = {
    open: 'Draft with AI',
    title: 'Draft screen additions',
    discard: 'Discard',
    discardAriaLabel: 'Discard draft',
    preview: 'Preview draft',
    apply: 'Apply draft',
    explanation: 'Layout only: add labels, ordinary inputs and Stack/Row containers. Query bindings unsupported. Inputs and buttons do not run commands or forms. Schemas are informational only. Views, actions and templates are not supported. Generation and preview do not save. Apply adds one undoable change; save the screen normally to persist it.',
    instruction: 'Describe the additions',
    generate: 'Generate draft',
    generating: 'Generating…',
    status: 'Generating a proposal…',
    review: 'Draft review',
    additions: 'Proposed additions',
    addControl: target => `Add control to ${target}`,
    setProperty: (path, node) => `Set ${path} on ${node}`,
    changed: 'The screen changed. Generate a new draft.',
    generationFailed: 'The draft could not be generated. Check the configured screen-design agent and try again.',
    applyFailed: 'The draft could not be applied.',
    undoLabel: 'Apply AI draft',
};
