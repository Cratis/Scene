// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { areRenderEquivalent, canonicalFormOf, withoutNative } from '../sceneDocumentCanonicalForm';
import { screenDocumentsOfSlice } from '../screenDocumentsOfSlice';
import type { FormSyntax, ScreenSyntax } from '../Syntax/ScreenplaySyntax';

// The corpus the C# bridge generates is the reference: it holds the syntax a host hands this bridge and the
// document Cratis.Scene.Screenplay made of it. A change on either side shows up here.
//
// What is compared is what a host *draws*: the canonical form of the document without the native residue, which
// is printed .play text the C# bridge keeps so an exact document can be written back out. Only C# can print .play,
// so this bridge never writes it; nothing a screen looks like depends on it.
interface CorpusSlice {
    sliceId: string;
    roles: string[] | null;
    screens: ScreenSyntax[];
    forms: FormSyntax[];
    documents: { roleName: string | null; document: string }[];
}

interface CorpusCase {
    name: string;
    play: string;
    slices: CorpusSlice[];
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const corpus = JSON.parse(readFileSync(join(root, 'screenplay-scene-document-fixtures.json'), 'utf8')) as { cases: CorpusCase[] };

const imported = (slice: CorpusSlice) => screenDocumentsOfSlice({
    sliceId: slice.sliceId,
    screens: slice.screens,
    forms: slice.forms,
    roles: slice.roles === null ? undefined : new Set(slice.roles),
});

describe('when importing the shared corpus', () => {
    it('should have cases to import', () => expect(corpus.cases.length).toBeGreaterThan(0));

    for (const corpusCase of corpus.cases) {
        for (const [index, slice] of corpusCase.slices.entries()) {
            const where = `${corpusCase.name} (slice ${index})`;

            it(`should produce a document for every role the C# bridge does - ${where}`, () => {
                const documents = imported(slice).documents;
                expect(documents.map(document => document.roleName ?? null)).toEqual(slice.documents.map(document => document.roleName));
            });

            it(`should draw the same screen as the C# bridge - ${where}`, () => {
                const documents = imported(slice).documents;
                for (const [position, expected] of slice.documents.entries()) {
                    const actual = documents[position];
                    expect(actual, `no document at ${position}`).toBeDefined();
                    expect(canonicalFormOf(withoutNative(actual.document)), `${where} role ${expected.roleName ?? '(none)'}`)
                        .toEqual(canonicalFormOf(withoutNative(expected.document)));
                    expect(areRenderEquivalent(actual.document, expected.document)).toBe(true);
                }
            });
        }
    }
});
