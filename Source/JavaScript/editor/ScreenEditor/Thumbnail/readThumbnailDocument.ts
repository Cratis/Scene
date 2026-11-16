// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import { readSceneDocument, SceneDocumentProblem } from '../Document/readSceneDocument';
import { screenName, studioLayout } from '../Document/studioScreen';
import { parseStoredDocument } from '../Document/upgradeStoredDocument';

// A board can show hundreds of slices and re-render often, and a document is a long string; it is read once per text. Held weakly by nothing but
// the map's own size cap, so a long session does not collect every document it has ever shown.
const cache = new Map<string, SceneDocument | undefined>();
const capacity = 200;

// The document a thumbnail draws, or nothing when the text is not a document the editor could open - in which case the board shows the earlier
// miniature instead, never an error. The same reader the editor opens a screen with, so what the board accepts is what the editor accepts.
export function readThumbnailDocument(text: string | undefined): SceneDocument | undefined {
    if (!text) return undefined;
    if (cache.has(text)) return cache.get(text);
    const read = readSceneDocument(text);
    const document = read.readable ? read.document : read.problem === SceneDocumentProblem.MissingScreen ? templateAsScreen(text) : undefined;
    if (cache.size >= capacity) cache.delete(cache.keys().next().value as string);
    cache.set(text, document);
    return document;
}

// A screen template's document holds no screen, so it has nothing to draw. It is drawn as the screen that uses it and fills none of its slots - which is
// what a screen of the template shows before it says anything of its own: the template's content in its slots, arranged as the template arranges them.
function templateAsScreen(text: string): SceneDocument | undefined {
    const candidate = parseStoredDocument<SceneDocument>(text);
    const [template] = candidate.screenTemplates;
    if (candidate.screenTemplates.length !== 1 || !template) return undefined;
    return {
        ...candidate,
        layouts: candidate.layouts.length > 0 ? candidate.layouts : [studioLayout],
        screens: [{ name: screenName, layout: candidate.layouts[0]?.name ?? studioLayout.name, screenTemplate: template.name, slotContent: {}, forms: [], contributions: [] }],
    };
}
