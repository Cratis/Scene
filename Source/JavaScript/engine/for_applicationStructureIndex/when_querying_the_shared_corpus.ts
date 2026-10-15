// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ApplicationStructure } from '@cratis/scene.model';
import { ApplicationStructureIndex, StructureDiagnostic, StructureDiagnosticCode } from '../index';

interface Query {
    op: string;
    arg: string;
    expected: string | string[] | null;
}

interface FixtureCase {
    name: string;
    structure: ApplicationStructure;
    queries: Query[];
    expectedDiagnostics: StructureDiagnostic[];
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../application-structure-fixtures.json'), 'utf-8')) as { cases: FixtureCase[] };

function answer(index: ApplicationStructureIndex, query: Query): string | string[] | null {
    switch (query.op) {
        case 'findModule': return index.findModule(query.arg)?.name ?? null;
        case 'findFeature': return index.findFeature(query.arg)?.name ?? null;
        case 'firstFeature': return index.firstFeature(query.arg)?.name ?? null;
        case 'firstFeatureId': return index.firstFeatureId(query.arg) ?? null;
        case 'findSlice': return index.findSlice(query.arg)?.name ?? null;
        case 'kindOf': return index.kindOf(query.arg) ?? null;
        case 'featuresByName': return index.findFeaturesByName(query.arg);
        default: throw new Error(`Unknown fixture operation '${query.op}'.`);
    }
}

describe('when querying the shared application structure corpus', () => {
    it('should carry a negative vector for every diagnostic code', () => {
        const codes = new Set(corpus.cases.flatMap(fixture => fixture.expectedDiagnostics.map(diagnostic => diagnostic.code)));
        [...codes].should.have.members(Object.values(StructureDiagnosticCode));
    });
});

for (const fixture of corpus.cases) {
    describe(`when indexing the structure for ${fixture.name}`, () => {
        let index: ApplicationStructureIndex;
        let original: string;

        beforeEach(() => {
            original = JSON.stringify(fixture.structure);
            index = new ApplicationStructureIndex(fixture.structure);
        });

        for (const query of fixture.queries) {
            it(`should answer ${query.op}(${query.arg}) as the C# engine does`, () => {
                JSON.stringify(answer(index, query)).should.equal(JSON.stringify(query.expected));
            });
        }

        it('should report the same diagnostics as the C# engine', () => index.diagnostics.should.deep.equal(fixture.expectedDiagnostics));
        it('should not rewrite the authored structure', () => JSON.stringify(fixture.structure).should.equal(original));
    });
}
