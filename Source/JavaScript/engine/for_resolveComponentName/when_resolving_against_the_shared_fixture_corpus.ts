// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { UiProfile } from '@cratis/scene.model';
import { ComponentResolution, PackageCatalog, resolveComponentName } from '../index';

interface FixtureCase {
    name: string;
    profile: { packages: string[] };
    catalog: PackageCatalog;
    requestedName: string;
    expected: ComponentResolution | null;
}

interface FixtureCorpus {
    cases: FixtureCase[];
}

const manifestPath = join(import.meta.dirname, '..', '..', '..', '..', 'package-resolution-fixtures.json');
const corpus = JSON.parse(readFileSync(manifestPath, 'utf-8')) as FixtureCorpus;

describe('when resolving against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.cases) {
        it(`should match the expected resolution for "${fixtureCase.name}"`, () => {
            const profile: UiProfile = { name: 'test', targetPlatform: 'web', packages: fixtureCase.profile.packages };
            const actual = resolveComponentName(fixtureCase.requestedName, profile, fixtureCase.catalog);
            if (fixtureCase.expected === null) {
                (actual === undefined).should.be.true;
            } else {
                actual!.should.deep.equal(fixtureCase.expected);
            }
        });
    }
});
