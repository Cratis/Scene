// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ComponentDescriptor, EditingScope, QueryCandidate, SceneDiagnostic, SceneDocument, SceneEdit } from '@cratis/scene.model';
import { applyEdit, createDescriptorCatalog } from '../index';

interface EditCorpusCase {
    name: string;
    document: string;
    scope: EditingScope;
    queryCandidates?: QueryCandidate[];
    steps: { edit: SceneEdit; applied: boolean; diagnostics: SceneDiagnostic[] }[];
    expectedDocument: SceneDocument;
}

const path = join(import.meta.dirname, '..', '..', '..', '..', '..', 'scene-edit-fixtures.json');
const corpus = JSON.parse(readFileSync(path, 'utf-8')) as {
    components: ComponentDescriptor[];
    documents: Record<string, SceneDocument>;
    cases: EditCorpusCase[];
};
const catalog = createDescriptorCatalog(corpus.components);

// Cratis.Scene.Engine applies these same cases (EditApplier) and must give the outcomes recorded here. The file is written by
// generate-edit-fixtures.mjs from this engine, so this spec is what keeps the reference and the recording from drifting apart:
// change an edit's behavior and regenerate, and the C# spec shows what the other engine has to follow.
describe('when applying the shared edit corpus', () => {
    it('should have cases for every kind of edit', () => {
        const kinds = new Set(corpus.cases.flatMap(fixture => fixture.steps.map(step => step.edit.kind)));
        kinds.size.should.equal(14);
    });

    it('should have cases that are refused and cases that are applied', () => {
        const steps = corpus.cases.flatMap(fixture => fixture.steps);
        steps.some(step => step.applied).should.be.true;
        steps.some(step => !step.applied).should.be.true;
    });

    for (const fixture of corpus.cases) {
        it(`should give the recorded outcome: ${fixture.name}`, () => {
            let current = structuredClone(corpus.documents[fixture.document]);
            const context = { catalog, scope: fixture.scope, queryCandidates: fixture.queryCandidates };

            for (const step of fixture.steps) {
                const before = current;
                const outcome = applyEdit(before, structuredClone(step.edit), context);
                outcome.applied.should.equal(step.applied);
                JSON.parse(JSON.stringify(outcome.diagnostics)).should.deep.equal(step.diagnostics);
                if (!outcome.applied) outcome.model.should.equal(before);
                current = outcome.model;
            }

            JSON.parse(JSON.stringify(current)).should.deep.equal(fixture.expectedDocument);
        });
    }
});
