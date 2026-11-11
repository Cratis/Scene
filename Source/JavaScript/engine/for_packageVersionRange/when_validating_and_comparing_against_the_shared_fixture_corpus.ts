// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { compareVersions, isValidVersion, isValidVersionRange } from '../index';
import { corpus } from '../for_packageDependencies/fixtures';

describe('when validating and comparing against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.versionRangeValidityCases) {
        describe(`range '${fixtureCase.range ?? '<null>'}'`, () => {
            let result: boolean;

            beforeEach(() => {
                result = isValidVersionRange(fixtureCase.range ?? undefined);
            });

            it('should be judged the same way the corpus does', () => result.should.equal(fixtureCase.expected));
        });
    }

    for (const fixtureCase of corpus.versionValidityCases) {
        describe(`version '${fixtureCase.version ?? '<null>'}'`, () => {
            let result: boolean;

            beforeEach(() => {
                result = isValidVersion(fixtureCase.version ?? undefined);
            });

            it('should be judged the same way the corpus does', () => result.should.equal(fixtureCase.expected));
        });
    }

    for (const fixtureCase of corpus.versionComparisonCases) {
        describe(`'${fixtureCase.left}' against '${fixtureCase.right}'`, () => {
            let result: number;

            beforeEach(() => {
                result = Math.sign(compareVersions(fixtureCase.left, fixtureCase.right));
            });

            it('should be ordered the same way the corpus does', () => result.should.equal(fixtureCase.expected));
        });
    }
});
