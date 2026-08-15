// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Theme, UiStarter } from '@cratis/scene.model';
import { incompatibleStarterThemes } from '../index';

interface FixtureCase {
    name: string;
    starter: UiStarter;
    themes: Record<string, Theme>;
    expectedIncompatible: string[];
}

interface FixtureCorpus {
    themeCases: FixtureCase[];
}

const manifestPath = join(import.meta.dirname, '..', '..', '..', '..', 'ui-starter-fixtures.json');
const corpus = JSON.parse(readFileSync(manifestPath, 'utf-8')) as FixtureCorpus;

describe('when checking against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.themeCases) {
        const themes: Record<string, Theme> = {};
        for (const [themeName, theme] of Object.entries(fixtureCase.themes)) {
            themes[themeName] = { name: themeName, compatibleWith: theme.compatibleWith };
        }

        it(`should match the expected incompatible themes for "${fixtureCase.name}"`, () => {
            incompatibleStarterThemes(fixtureCase.starter, themes).should.deep.equal(fixtureCase.expectedIncompatible);
        });
    }
});
