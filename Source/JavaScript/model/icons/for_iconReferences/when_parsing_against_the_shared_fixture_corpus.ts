// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'chai';
import { parseIconReference } from '../iconReferences';
import { corpus } from './fixtures';

describe('when parsing against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.parseCases) {
        it(`should produce the expected reference for "${fixtureCase.name}"`, () => {
            const parsed = parseIconReference(fixtureCase.text);
            expect(parsed ?? null).to.deep.equal(fixtureCase.expected);
        });
    }
});
