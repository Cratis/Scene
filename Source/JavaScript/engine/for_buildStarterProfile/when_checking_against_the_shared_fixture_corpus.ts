// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { UiStarter } from '@cratis/scene.model';
import { buildStarterProfile } from '../index';

interface FixtureCase {
    name: string;
    starter: UiStarter;
    targetPlatform: string;
    expectedProfile: { name: string; targetPlatform: string; packages: string[] };
}

interface FixtureCorpus {
    profileCases: FixtureCase[];
}

const manifestPath = join(import.meta.dirname, '..', '..', '..', '..', 'ui-starter-fixtures.json');
const corpus = JSON.parse(readFileSync(manifestPath, 'utf-8')) as FixtureCorpus;

describe('when checking against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.profileCases) {
        it(`should build the expected profile for "${fixtureCase.name}"`, () => {
            const profile = buildStarterProfile(fixtureCase.starter, fixtureCase.targetPlatform);
            profile.name.should.equal(fixtureCase.expectedProfile.name);
            profile.targetPlatform.should.equal(fixtureCase.expectedProfile.targetPlatform);
            profile.packages.should.deep.equal(fixtureCase.expectedProfile.packages);
        });
    }
});
