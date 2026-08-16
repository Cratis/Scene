// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Layout, ScreenTemplate } from '@cratis/scene.model';
import { isScreenTemplateResolutionValid, resolveScreenTemplates } from '../index';

interface FixtureCase {
    name: string;
    layout: { name: string; slots: string[] };
    templates: { name: string; fitsSlot: string | null; slots: string[] }[];
    expectedPlacements: { template: string; slot: string; container: string; depth: number }[];
    expectedUnplaced: { template: string; slot: string; candidates: string[] }[];
    expectedCycles: string[][];
}

const fixturePath = join(import.meta.dirname, '..', '..', '..', '..', 'screen-template-fixtures.json');
const corpus = JSON.parse(readFileSync(fixturePath, 'utf-8')) as { cases: FixtureCase[] };

describe('when resolving against the shared fixture corpus', () => {
    for (const fixtureCase of corpus.cases) {
        const layout: Layout = { name: fixtureCase.layout.name, slots: fixtureCase.layout.slots.map((name) => ({ name })) };
        const templates: ScreenTemplate[] = fixtureCase.templates.map((template) => ({
            name: template.name,
            fitsSlot: template.fitsSlot ?? undefined,
            slots: template.slots.map((name) => ({ name })),
        }));

        const resolution = resolveScreenTemplates(layout, templates);

        it(`should place every template where the corpus expects for "${fixtureCase.name}"`, () => {
            resolution.placements.should.deep.equal(fixtureCase.expectedPlacements);
        });

        it(`should report the expected unplaced templates for "${fixtureCase.name}"`, () => {
            resolution.unplaced.should.deep.equal(fixtureCase.expectedUnplaced);
        });

        it(`should report the expected cycles for "${fixtureCase.name}"`, () => {
            resolution.cycles.should.deep.equal(fixtureCase.expectedCycles);
        });

        it(`should consider "${fixtureCase.name}" valid only when nothing is wrong`, () => {
            const expectedValid = fixtureCase.expectedUnplaced.length === 0 && fixtureCase.expectedCycles.length === 0;
            isScreenTemplateResolutionValid(resolution).should.equal(expectedValid);
        });
    }
});
