// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isPackageSelectionValid, resolvePackageDependencies } from '../index';
import { corpus } from './fixtures';

describe('when resolving against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.resolutionCases) {
        const selection = resolvePackageDependencies(fixtureCase.selected, corpus.catalog);

        it(`should order the packages as expected for "${fixtureCase.name}"`, () => {
            selection.packages.should.deep.equal(fixtureCase.expectedPackages);
        });

        it(`should report the expected transitively added packages for "${fixtureCase.name}"`, () => {
            selection.added.should.deep.equal(fixtureCase.expectedAdded);
        });

        it(`should report the expected missing dependencies for "${fixtureCase.name}"`, () => {
            selection.missing.should.deep.equal(fixtureCase.expectedMissing);
        });

        it(`should report the expected version conflicts for "${fixtureCase.name}"`, () => {
            selection.versionConflicts.should.deep.equal(fixtureCase.expectedVersionConflicts);
        });

        it(`should report the expected cycles for "${fixtureCase.name}"`, () => {
            selection.cycles.should.deep.equal(fixtureCase.expectedCycles);
        });

        it(`should consider "${fixtureCase.name}" valid only when nothing is wrong`, () => {
            const expectedValid =
                fixtureCase.expectedMissing.length === 0 &&
                fixtureCase.expectedVersionConflicts.length === 0 &&
                fixtureCase.expectedCycles.length === 0;
            isPackageSelectionValid(selection).should.equal(expectedValid);
        });
    }
});
