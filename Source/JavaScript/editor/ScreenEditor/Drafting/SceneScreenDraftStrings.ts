// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

export interface SceneScreenDraftStrings {
    open: string;
    title: string;
    discard: string;
    discardAriaLabel: string;
    preview: string;
    apply: string;
    explanation: string;
    instruction: string;
    generate: string;
    generating: string;
    status: string;
    review: string;
    additions: string;
    addControl: (target: string) => string;
    setProperty: (path: string, node: string) => string;
    changed: string;
    generationFailed: string;
    applyFailed: string;
    undoLabel: string;
}
