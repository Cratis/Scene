// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Theme, UiProfile } from '@cratis/scene.model';
import { applicableThemePackages, incompatiblePackages } from '../index';

interface FixtureCase {
    name: string;
    theme: { compatibleWith: string[] };
    profile: { packages: string[] };
    expectedIncompatible: string[];
    expectedApplicable: string[];
}

interface FixtureCorpus {
    cases: FixtureCase[];
}

const manifestPath = join(import.meta.dirname, '..', '..', '..', '..', 'theme-compatibility-fixtures.json');
const corpus = JSON.parse(readFileSync(manifestPath, 'utf-8')) as FixtureCorpus;

describe('when checking against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.cases) {
        const theme: Theme = { name: 'test-theme', compatibleWith: fixtureCase.theme.compatibleWith };
        const profile: UiProfile = { name: 'test-profile', targetPlatform: 'web', packages: fixtureCase.profile.packages };

        it(`should match the expected incompatible packages for "${fixtureCase.name}"`, () => {
            incompatiblePackages(theme, profile).should.deep.equal(fixtureCase.expectedIncompatible);
        });

        it(`should match the expected applicable packages for "${fixtureCase.name}"`, () => {
            applicableThemePackages(theme, profile).should.deep.equal(fixtureCase.expectedApplicable);
        });
    }
});
