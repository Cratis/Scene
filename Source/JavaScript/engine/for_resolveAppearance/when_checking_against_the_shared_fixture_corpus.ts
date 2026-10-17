// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ProfileAppearance, Theme } from '@cratis/scene.model';
import { AppearanceDiagnosticCode, resolveAppearance } from '../index';

interface AppearanceCase {
    name: string;
    description: string;
    theme: Theme | null;
    appearance: ProfileAppearance | null;
    systemIsDark: boolean;
    availableFonts: string[] | null;
    expected: { diagnostics: { code: string }[] };
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../profile-appearance-fixtures.json'), 'utf-8')) as { cases: AppearanceCase[] };
const resolved = (fixture: AppearanceCase) => JSON.parse(JSON.stringify(resolveAppearance({
    theme: fixture.theme ?? undefined,
    appearance: fixture.appearance ?? undefined,
    systemIsDark: fixture.systemIsDark,
    availableFonts: fixture.availableFonts ?? undefined,
})));

describe('when resolving the appearance against the shared fixture corpus', () => {
    it('should have cases in the corpus', () => corpus.cases.length.should.be.greaterThan(15));

    it('should cover every diagnostic code', () => {
        const covered = new Set(corpus.cases.flatMap(fixture => fixture.expected.diagnostics.map(diagnostic => diagnostic.code)));
        [...covered].sort().should.deep.equal(Object.values(AppearanceDiagnosticCode).sort());
    });

    for (const fixture of corpus.cases) {
        describe(`and the case is ${fixture.name}`, () => {
            it('should resolve what the corpus expects', () => resolved(fixture).should.deep.equal(fixture.expected));
        });
    }
});
