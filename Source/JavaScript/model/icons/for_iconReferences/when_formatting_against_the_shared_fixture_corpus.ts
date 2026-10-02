// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { formatIconReference } from '../iconReferences';
import { corpus } from './fixtures';

describe('when formatting against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.formatCases) {
        it(`should produce the expected text for "${fixtureCase.name}"`, () => {
            formatIconReference(fixtureCase.reference).should.equal(fixtureCase.expected);
        });
    }
});
