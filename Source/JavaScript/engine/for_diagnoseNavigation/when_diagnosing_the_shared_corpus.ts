// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NavigationDiagnostic, NavigationGraph, diagnoseNavigation } from '../index';

interface FixtureCase {
    name: string;
    graph: NavigationGraph;
    expectedDiagnostics: NavigationDiagnostic[];
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../navigation-diagnostic-fixtures.json'), 'utf-8')) as { cases: FixtureCase[] };

describe('when diagnosing the shared navigation corpus', () => {
    it('should carry negative vectors for every diagnostic code', () => {
        const codes = new Set(corpus.cases.flatMap(fixture => fixture.expectedDiagnostics.map(diagnostic => diagnostic.code)));
        [...codes].should.have.members(['duplicateRoute', 'duplicateOutlet', 'missingOutlet', 'incompatibleOutlet', 'navigationCycle', 'unavailableTarget']);
    });
});

for (const fixture of corpus.cases) {
    describe(`when diagnosing navigation for ${fixture.name}`, () => {
        let diagnostics: NavigationDiagnostic[];
        let original: string;

        beforeEach(() => {
            original = JSON.stringify(fixture.graph);
            diagnostics = diagnoseNavigation(fixture.graph);
        });

        it('should report the same diagnostics as the C# engine', () => diagnostics.should.deep.equal(fixture.expectedDiagnostics));
        it('should not rewrite the authored graph', () => JSON.stringify(fixture.graph).should.equal(original));
    });
}
