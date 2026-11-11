// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { UiProfile } from '@cratis/scene.model';
import { ProfileFix, applyProfileFix, findProfileProblems } from '../index';

interface FixEdgeCase {
    name: string;
    profile: UiProfile;
    fix: ProfileFix;
    expected: UiProfile;
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../profile-blockers-fixtures.json'), 'utf-8')) as { fixEdgeCases: FixEdgeCase[] };

describe('when fixing sparse profiles against the shared fixture corpus', () => {
    for (const fixture of corpus.fixEdgeCases) {
        let result: unknown;
        let before: string;
        let after: string;

        beforeEach(() => {
            before = JSON.stringify(fixture.profile);
            result = JSON.parse(JSON.stringify(applyProfileFix(fixture.profile, fixture.fix, [])));
            after = JSON.stringify(fixture.profile);
        });

        it(`should give the profile the corpus expects for ${fixture.name}`, () => (result as UiProfile).should.deep.equal(fixture.expected));
        it(`should leave the input profile untouched for ${fixture.name}`, () => after.should.equal(before));
    }

    describe('with no shell, theme, usage or own library', () => {
        let problems: unknown;

        beforeEach(() => {
            problems = findProfileProblems(corpus.fixEdgeCases[0].profile, { packages: [], library: { blueprints: [] } });
        });

        it('should find no problems', () => (problems as unknown[]).should.deep.equal([]));
    });
});
