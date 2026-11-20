// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { FormSyntax, ScreenCodeSyntax, ScreenDirectiveSyntax, ScreenSyntax } from './Syntax/ScreenplaySyntax';
import { containsSceneDocumentReference, decodeSceneDocumentReference, sceneDocumentReferencePrefix } from './sceneDocumentReferences';
import type { ImportedScreenDocument } from './ImportedScreenDocument';

// The mirror of SceneDocumentCarrier's read half: the exact Scene document a .play carries beside a typed screen,
// for content Screenplay cannot say. A screen exported from Studio's screen editor carries one, which is why this
// path is both the cheapest and the most faithful - nothing is converted, the document is the one Studio saved.
const metadataFormPrefix = 'StudioSceneDocument';

export const isCarrierForm = (form: FormSyntax): boolean => form.name.startsWith(metadataFormPrefix);

export const isCarrierDirective = (directive: ScreenDirectiveSyntax): boolean =>
    directive.kind === 'ScreenCodeSyntax' && containsSceneDocumentReference((directive as ScreenCodeSyntax).code.code);

// The carried document of one screen, when it carries one. Looked for exactly where the writing side puts it: the
// code directive first, then a form of the module, and last the screen's own file reference.
export const carriedDocumentOf = (sliceId: string, screen: ScreenSyntax, forms: readonly FormSyntax[]): ImportedScreenDocument | undefined => {
    for (const directive of screen.directives) {
        if (!isCarrierDirective(directive)) continue;
        // The writing side joins the two lines with the newline of the machine it ran on, so both are accepted:
        // a .play written on Windows reads the same here as one written on Linux.
        const lines = (directive as ScreenCodeSyntax).code.code.split(/\r?\n/).filter(line => line.length > 0);
        const document = lines.length >= 2 ? decodeReference(lines[1]) : undefined;
        if (document !== undefined) return withActor(sliceId, lines[0], document);
    }

    for (const form of forms) {
        if (!isCarrierForm(form)) continue;
        const fields = new Map(form.fields.map(field => [field.property, field.label] as const));
        if (fields.get('screen') !== screen.name) continue;
        const document = decodeReference(fields.get('document') ?? undefined);
        if (document !== undefined) return withActor(sliceId, fields.get('actorId') ?? undefined, document);
    }

    const preserved = decodeSceneDocumentReference(screen.file);
    return preserved === undefined ? undefined : { sliceId, document: preserved };
};

const decodeReference = (reference: string | null | undefined): string | undefined =>
    reference !== null && reference !== undefined && reference.startsWith(sceneDocumentReferencePrefix)
        ? decodeSceneDocumentReference(reference)
        : undefined;

const withActor = (sliceId: string, actorId: string | null | undefined, document: string): ImportedScreenDocument =>
    actorId !== null && actorId !== undefined && actorId.trim().length > 0
        ? { sliceId, actorId, document }
        : { sliceId, document };
