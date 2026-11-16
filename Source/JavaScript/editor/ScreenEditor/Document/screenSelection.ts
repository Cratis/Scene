// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import { screenName } from './studioScreen';

// A slice's document can hold several screens, but the editor and the miniature always work on the one called 'Screen'. To open another screen of
// the document, it takes that name and the screen that had it takes the other's: the same swap undoes it, so a document that is opened on a screen
// and saved from it comes back with every screen under the name it had, and nothing else is touched.
export function withScreenAsPrimary(document: SceneDocument, screen?: string): SceneDocument {
    if (screen === undefined || screen === screenName) return document;
    if (!document.screens.some(candidate => candidate.name === screen)) return document;
    return {
        ...document,
        screens: document.screens.map(candidate => candidate.name === screen ? { ...candidate, name: screenName } : candidate.name === screenName ? { ...candidate, name: screen } : candidate),
    };
}

// Undoes withScreenAsPrimary for a document that was opened on `screen` and edited: the screen that has the name Screen gets `screen`'s name back, and the screen that
// had it before gets Screen back. A document that held no screen called Screen has none to swap with, so the one called Screen is renamed.
export function withScreenRestored(document: SceneDocument, screen?: string): SceneDocument {
    if (screen === undefined || screen === screenName) return document;
    if (document.screens.some(candidate => candidate.name === screen)) return withScreenAsPrimary(document, screen);
    if (!document.screens.some(candidate => candidate.name === screenName)) return document;
    return { ...document, screens: document.screens.map(candidate => candidate.name === screenName ? { ...candidate, name: screen } : candidate) };
}

// The names of the screens a document holds, the one called 'Screen' first.
export function screenNamesOf(document: SceneDocument): string[] {
    const names = document.screens.map(screen => screen.name);
    return [...names.filter(name => name === screenName), ...names.filter(name => name !== screenName)];
}
