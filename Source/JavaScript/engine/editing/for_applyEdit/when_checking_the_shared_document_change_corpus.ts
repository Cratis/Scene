// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EditingScope, SceneDocument, SceneEdit } from '@cratis/scene.model';
import { applyEdit } from '../index';
import { catalog } from '../given/a_scene_document';

interface DocumentChangeCase {
    name: string;
    scope: EditingScope;
    references: Record<string, SceneDocument>;
    previous: SceneDocument | null;
    submitted: SceneDocument | string;
    edit: SceneEdit | null;
    expected: { accepted: boolean; codes: string[] };
}

const path = join(import.meta.dirname, '..', '..', '..', '..', '..', 'document-change-fixtures.json');
const corpus = JSON.parse(readFileSync(path, 'utf-8')) as { cases: DocumentChangeCase[] };
const edited = corpus.cases.filter(documentCase => documentCase.edit !== null && documentCase.previous !== null && Object.keys(documentCase.references).length > 0);

// The server checks a submitted document against these same cases (Cratis.Scene.Engine, SceneDocumentChangeValidation). Here the
// editor is what is asked: a change the corpus says is allowed must be one applyEdit makes and produce exactly the document the
// server is shown, and a change it says is refused must be refused by the editor for the reason the server gives.
describe('when checking the shared document change corpus', () => {
    it('should have cases for the editor and cases only for the server', () => {
        edited.length.should.be.greaterThan(10);
        corpus.cases.length.should.be.greaterThan(edited.length);
    });

    for (const documentCase of edited) {
        const outcome = applyEdit(structuredClone(documentCase.previous!), documentCase.edit!, { catalog, scope: documentCase.scope });

        if (documentCase.expected.accepted) {
            it(`should apply: ${documentCase.name}`, () => outcome.applied.should.be.true);
            it(`should produce the document the server is shown: ${documentCase.name}`, () => outcome.model.should.deep.equal(documentCase.submitted));
        } else {
            it(`should refuse: ${documentCase.name}`, () => outcome.applied.should.be.false);
            it(`should refuse for the reason the server gives: ${documentCase.name}`, () => {
                const codes = outcome.diagnostics.map(diagnostic => diagnostic.code as string);
                documentCase.expected.codes.forEach(code => codes.should.include(code));
            });
        }
    }
});
