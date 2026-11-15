// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { authoredRoot, createScreenDocument } from './studioScreen';
import { readSceneDocument } from './readSceneDocument';

// The text of a new screen that starts out as a copy of what a template authored, or nothing when the template has no
// document to copy from (it was never saved from the editor, or cannot be read). Only the content is copied: what the
// template exposes stays with the template, and the screen is not built from it - it is a starting point, as seeding from a
// template has always been.
export function seedScreenFromTemplate(templateDocument: string | undefined, templateName: string): string | undefined {
    if (!templateDocument) return undefined;

    const read = readSceneDocument(templateDocument, templateName);
    const root = read.readable ? authoredRoot(read.document, templateName) : undefined;
    return root ? JSON.stringify(createScreenDocument(root)) : undefined;
}
