// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { upgradeSlotShape } from '@cratis/scene.engine';

// A Scene document - a screen, a template, a UI profile, a preview scene - as Scene 5 reads it. One stored before Scene 5 declares its regions as outlets,
// its navigation as regions, its toolbar as an element of its own and an action's presentation; Scene's upgrader brings it to the slot shape when it is
// read (StudioIssues#1328). What was stored is not touched - the next save writes the new shape - and a document already in the slot shape comes back as
// the same object.
export function upgradeStoredDocument<T>(document: T): T {
    const upgrade = upgradeSlotShape(document);
    return upgrade.changed ? upgrade.document as T : document;
}

// A stored document's text, parsed and read in the slot shape.
export function parseStoredDocument<T>(text: string): T {
    return upgradeStoredDocument(JSON.parse(text) as T);
}
