// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DesignSystem, ProfileAppearance, Theme } from '@cratis/scene.model';
import { DesignDiagnosticCode, resolveDesign } from '../index';
import { project } from './project';

interface DesignCase {
    name: string;
    description: string;
    designSystem: DesignSystem;
    theme: string | null;
    packageThemes: Theme[] | null;
    appearance: ProfileAppearance | null;
    systemIsDark: boolean;
    availableFonts: string[] | null;
    expected: unknown;
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../design-resolution-fixtures.json'), 'utf-8')) as { cases: DesignCase[] };
const resolved = (fixture: DesignCase) => project(resolveDesign({
    designSystem: fixture.designSystem,
    theme: fixture.theme ?? undefined,
    packageThemes: fixture.packageThemes ?? undefined,
    appearance: fixture.appearance ?? undefined,
    systemIsDark: fixture.systemIsDark,
    availableFonts: fixture.availableFonts ?? undefined,
}));

describe('when resolving a design against the shared fixture corpus', () => {
    it('should have cases in the corpus', () => corpus.cases.length.should.be.greaterThan(10));

    it('should cover every diagnostic code', () => {
        const covered = new Set(corpus.cases.flatMap(fixture => (fixture.expected as { diagnostics: { code: string }[] }).diagnostics.map(diagnostic => diagnostic.code)));
        [...covered].sort().should.deep.equal(Object.values(DesignDiagnosticCode).sort());
    });

    for (const fixture of corpus.cases) {
        describe(`and the case is ${fixture.name}`, () => {
            it('should resolve what the corpus expects', () => resolved(fixture).should.deep.equal(fixture.expected));
        });
    }
});
