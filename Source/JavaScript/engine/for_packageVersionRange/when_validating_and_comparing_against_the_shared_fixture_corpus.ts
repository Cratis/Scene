// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { compareVersions, isValidVersion, isValidVersionRange } from '../index';
import { corpus } from '../for_packageDependencies/fixtures';

describe('when validating and comparing against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.versionRangeValidityCases) {
        it(`should judge range '${fixtureCase.range ?? '<null>'}' the same way the corpus does`, () => {
            isValidVersionRange(fixtureCase.range ?? undefined).should.equal(fixtureCase.expected);
        });
    }

    for (const fixtureCase of corpus.versionValidityCases) {
        it(`should judge version '${fixtureCase.version ?? '<null>'}' the same way the corpus does`, () => {
            isValidVersion(fixtureCase.version ?? undefined).should.equal(fixtureCase.expected);
        });
    }

    for (const fixtureCase of corpus.versionComparisonCases) {
        it(`should order '${fixtureCase.left}' against '${fixtureCase.right}' the same way the corpus does`, () => {
            Math.sign(compareVersions(fixtureCase.left, fixtureCase.right)).should.equal(fixtureCase.expected);
        });
    }
});
