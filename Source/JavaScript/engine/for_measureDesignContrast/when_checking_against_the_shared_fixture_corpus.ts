// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DesignSystem } from '@cratis/scene.model';
import { contrastRatio, measureDesignContrast } from '../index';

interface Corpus {
    ratios: { foreground: string; background: string; expected: number | null }[];
    systems: { name: string; designSystem: DesignSystem; expected: unknown }[];
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../design-contrast-fixtures.json'), 'utf-8')) as Corpus;

describe('when measuring contrast against the shared fixture corpus', () => {
    it('should have cases in the corpus', () => corpus.ratios.length.should.be.greaterThan(5));

    for (const fixture of corpus.ratios) {
        it(`should measure ${fixture.foreground} on ${fixture.background}`, () => {
            const ratio = contrastRatio(fixture.foreground, fixture.background) ?? null;
            (ratio === fixture.expected).should.equal(true);
        });
    }

    for (const fixture of corpus.systems) {
        it(`should find what the corpus expects in ${fixture.name}`, () => JSON.parse(JSON.stringify(measureDesignContrast(fixture.designSystem))).should.deep.equal(fixture.expected));
    }
});
