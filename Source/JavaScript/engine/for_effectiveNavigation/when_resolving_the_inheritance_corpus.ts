// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructureIndex, diagnoseNavigationRegions } from '../index';
import { describeExpected, describeView, loadCorpus } from './given/navigation_fixtures';

const corpus = loadCorpus('navigation-inheritance-fixtures.json');

describe('when resolving the shared navigation inheritance corpus', () => {
    it('should carry cases', () => corpus.cases.length.should.be.greaterThan(5));
});

for (const fixture of corpus.cases) {
    describe(`when resolving navigation for ${fixture.name}`, () => {
        let index: ApplicationStructureIndex;
        let original: string;

        beforeEach(() => {
            original = JSON.stringify(fixture.navigation);
            index = new ApplicationStructureIndex(fixture.structure!);
        });

        for (const view of fixture.views) {
            it(`should resolve the ${view.module ?? 'application'} ${view.region} as the C# engine does`, () =>
                describeView(index, fixture.navigation, view).should.equal(describeExpected(view)));
        }

        it('should report the same diagnostics as the C# engine', () =>
            diagnoseNavigationRegions(index, fixture.navigation, { slots: fixture.slots }).should.deep.equal(fixture.expectedDiagnostics));
        it('should not rewrite the authored navigation', () => {
            fixture.views.forEach(view => describeView(index, fixture.navigation, view));
            JSON.stringify(fixture.navigation).should.equal(original);
        });
    });
}
