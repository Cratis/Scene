// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { UiProfile } from '@cratis/scene.model';
import { ProfileIdentityDiagnosticCode, resolveProfileIdentity } from '../index';

interface IdentityCase {
    name: string;
    description: string;
    hostName: string;
    profile: UiProfile;
    expected: unknown;
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../profile-identity-fixtures.json'), 'utf-8')) as { cases: IdentityCase[] };
const resolved = (fixture: IdentityCase) => JSON.parse(JSON.stringify(resolveProfileIdentity(fixture.profile, fixture.hostName)));

describe('when resolving the identity against the shared fixture corpus', () => {
    it('should have cases in the corpus', () => corpus.cases.length.should.be.greaterThan(15));

    it('should cover every diagnostic code', () => {
        const covered = new Set(corpus.cases.flatMap(fixture => (fixture.expected as { diagnostics: { code: string }[] }).diagnostics.map(diagnostic => diagnostic.code)));
        [...covered].sort().should.deep.equal(Object.values(ProfileIdentityDiagnosticCode).sort());
    });

    for (const fixture of corpus.cases) {
        describe(`and the case is ${fixture.name}`, () => {
            it('should resolve what the corpus expects', () => resolved(fixture).should.deep.equal(fixture.expected));
        });
    }
});
