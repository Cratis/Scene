// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { readThumbnailDocument } from '../readThumbnailDocument';

// The shared corpus the Screenplay bridge and its TypeScript mirror are both held to. A host outside Studio hands
// what the bridge produced to this reader and draws the result, so a document the bridge writes and this reader
// refuses would leave that host with a placeholder window and nothing to say about why.
interface Corpus {
    readonly cases: readonly {
        readonly name: string;
        readonly slices: readonly { readonly documents: readonly { readonly document: string }[] | null }[];
    }[];
}

const corpus = JSON.parse(readFileSync(new URL('../../../../../../screenplay-scene-document-fixtures.json', import.meta.url), 'utf8')) as Corpus;
const documents = corpus.cases.flatMap(entry => entry.slices.flatMap(slice => (slice.documents ?? []).map(held => ({ case: entry.name, text: held.document }))));

describe('when reading a document the Screenplay bridge produced', () => {
    it('should have documents in the corpus to read', () => documents.length.should.be.greaterThan(5));

    it('should read every one of them', () =>
        documents.filter(held => readThumbnailDocument(held.text) === undefined).map(held => held.case).should.deep.equal([]));

    it('should find a screen to draw in every one of them', () =>
        documents.filter(held => (readThumbnailDocument(held.text)?.screens.length ?? 0) === 0).map(held => held.case).should.deep.equal([]));

    it('should keep the layout each screen names', () =>
        documents.filter(held => {
            const document = readThumbnailDocument(held.text)!;
            return !document.layouts.some(layout => layout.name === document.screens[0].layout);
        }).map(held => held.case).should.deep.equal([]));
});
