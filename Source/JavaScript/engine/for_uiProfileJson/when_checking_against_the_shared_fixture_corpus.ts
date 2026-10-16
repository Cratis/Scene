// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseUiProfile, serializeUiProfile } from '../index';

interface FixtureCase {
    name: string;
    input: unknown;
    canonical: string;
}

interface FixtureCorpus {
    cases: FixtureCase[];
}

const manifestPath = join(import.meta.dirname, '..', '..', '..', '..', 'ui-profile-fixtures.json');
const corpus = JSON.parse(readFileSync(manifestPath, 'utf-8')) as FixtureCorpus;

describe('when checking against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.cases) {
        it(`should write the canonical bytes for "${fixtureCase.name}"`, () => {
            serializeUiProfile(parseUiProfile(fixtureCase.input)).should.equal(fixtureCase.canonical);
        });

        it(`should write the same bytes when reading the input as text for "${fixtureCase.name}"`, () => {
            serializeUiProfile(parseUiProfile(JSON.stringify(fixtureCase.input))).should.equal(fixtureCase.canonical);
        });

        it(`should be stable when the canonical form is read and written again for "${fixtureCase.name}"`, () => {
            serializeUiProfile(parseUiProfile(fixtureCase.canonical)).should.equal(fixtureCase.canonical);
        });
    }
});
