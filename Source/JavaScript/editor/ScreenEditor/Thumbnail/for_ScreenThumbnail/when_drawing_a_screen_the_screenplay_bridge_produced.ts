// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { corePackage } from '@cratis/scene.react';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { readThumbnailDocument } from '../readThumbnailDocument';
import { ScreenThumbnail } from '../ScreenThumbnail';

// A board outside Studio draws what the Screenplay bridge produced with this very component, so the shared corpus
// is drawn here rather than only read: a document that reads but draws nothing would show an empty window.
interface Corpus {
    readonly cases: readonly {
        readonly name: string;
        readonly slices: readonly { readonly documents: readonly { readonly document: string }[] | null }[];
    }[];
}

const corpus = JSON.parse(readFileSync(new URL('../../../../../../screenplay-scene-document-fixtures.json', import.meta.url), 'utf8')) as Corpus;
const documentsOf = (name: string) => corpus.cases.find(entry => entry.name === name)!.slices.flatMap(slice => slice.documents ?? []);

const profile = { name: 'p', targetPlatform: 'web', packages: ['core'] } as never;
const runtime = createScreenEditorRuntime([corePackage], profile);

const draw = (text: string) =>
    renderToStaticMarkup(createElement(ScreenThumbnail, { document: readThumbnailDocument(text)!, runtime, windowSize: { width: 1280, height: 760 } }));

describe('when drawing a screen the Screenplay bridge produced', () => {
    const markup = draw(documentsOf('a screen of content directives')[0].document);

    it('should draw the title the screen states', () => markup.should.include('Orders'));
    it('should draw the elements the screen states', () => markup.should.include('data-scene-id='));
    it('should not take part in interaction', () => markup.should.match(/data-screen-thumbnail-body="" inert/));
});

describe('when drawing a screen of several roles the Screenplay bridge produced', () => {
    it('should draw each role its own screen', () => {
        const documents = documentsOf('screens of several roles and a screen of its own');
        documents.length.should.be.greaterThan(1);
        for (const held of documents) draw(held.document).should.include('data-scene-id=');
    });
});
