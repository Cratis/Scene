// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NavigationMode, ProfileRegion, describeRegions } from '../index';

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../shell-regions-fixtures.json'), 'utf-8')) as {
    cases: { mode: NavigationMode; touch: boolean; menuOpen: boolean; expected: Record<string, unknown>[] }[];
};

describe('when asking which regions a shell exposes against the shared fixture corpus', () => {
    it('should cover every mode in both regimes and both menu states', () => corpus.cases.length.should.equal(Object.values(NavigationMode).length * 4));

    it('should expose the five regions every time', () => new Set(corpus.cases.flatMap(fixture => fixture.expected.map(region => region.id))).should.deep.equal(new Set(Object.values(ProfileRegion))));

    for (const fixture of corpus.cases) {
        it(`should answer for ${fixture.mode}, ${fixture.touch ? 'touch' : 'pointer'}, menu ${fixture.menuOpen ? 'open' : 'closed'}`, () =>
            JSON.parse(JSON.stringify(describeRegions(fixture.mode, fixture.touch, fixture.menuOpen))).should.deep.equal(fixture.expected));
    }
});
