// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { iconReferencesEqual } from '../iconReferences';
import { corpus } from './fixtures';

describe('when comparing against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.equalityCases) {
        it(`should match the expected equality for "${fixtureCase.name}"`, () => {
            iconReferencesEqual(fixtureCase.left, fixtureCase.right).should.equal(fixtureCase.expected);
        });
    }
});
