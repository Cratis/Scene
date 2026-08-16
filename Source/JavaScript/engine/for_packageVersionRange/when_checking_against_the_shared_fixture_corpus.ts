// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isVersionSatisfiedBy } from '../index';
import { corpus } from '../for_packageDependencies/fixtures';

describe('when checking against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.versionRangeCases) {
        it(`should decide ${fixtureCase.version} against '${fixtureCase.range ?? '<null>'}' the same way the corpus does`, () => {
            isVersionSatisfiedBy(fixtureCase.version, fixtureCase.range ?? undefined).should.equal(fixtureCase.expected);
        });
    }
});
