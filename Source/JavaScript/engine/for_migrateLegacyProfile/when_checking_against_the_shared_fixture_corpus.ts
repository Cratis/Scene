// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { UiProfile } from '@cratis/scene.model';
import { LegacyProfile, ProfileMigrationDiagnosticCode, TemplateLibrary, migrateLegacyProfile, parseUiProfile, serializeUiProfile } from '../index';

interface MigrationCase {
    name: string;
    description: string;
    legacy: Omit<LegacyProfile, 'profile'> & { profile: unknown };
    expected: {
        profile: string;
        changed: boolean;
        diagnostics: { code: string; subject: string | null; message: string }[];
    };
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../profile-migration-fixtures.json'), 'utf-8')) as {
    library: TemplateLibrary;
    cases: MigrationCase[];
};

const legacyOf = (fixture: MigrationCase): LegacyProfile => ({ ...fixture.legacy, profile: parseUiProfile(JSON.stringify(fixture.legacy.profile)) });
const describeDiagnostics = (diagnostics: { code: string; subject?: string | null; message: string }[]) => diagnostics.map(diagnostic => `${diagnostic.code}|${diagnostic.subject ?? ''}|${diagnostic.message}`);

describe('when migrating legacy profiles against the shared fixture corpus', () => {
    it('should have a case for every legacy permutation', () => corpus.cases.length.should.be.greaterThan(25));

    it('should cover every diagnostic code', () => {
        const covered = new Set(corpus.cases.flatMap(fixture => fixture.expected.diagnostics.map(diagnostic => diagnostic.code)));
        [...covered].sort().should.deep.equal(Object.values(ProfileMigrationDiagnosticCode).sort());
    });

    for (const fixture of corpus.cases) {
        describe(`and the case is ${fixture.name}`, () => {
            const legacy = legacyOf(fixture);
            const result = migrateLegacyProfile(legacy, corpus.library);

            it('should give the profile in the new shape', () => serializeUiProfile(result.profile).should.equal(fixture.expected.profile));
            it('should say whether it changed', () => result.changed.should.equal(fixture.expected.changed));
            it('should report what it could not map', () => describeDiagnostics(result.diagnostics).should.deep.equal(describeDiagnostics(fixture.expected.diagnostics)));

            it('should leave a migrated profile alone, with the legacy fields next to it', () => {
                const again = migrateLegacyProfile({ ...legacy, profile: result.profile }, corpus.library);
                [serializeUiProfile(again.profile), again.changed].should.deep.equal([fixture.expected.profile, false]);
            });

            it('should leave a migrated profile alone, without them', () => {
                const again = migrateLegacyProfile({ profile: result.profile }, corpus.library);
                again.profile.should.deep.equal(result.profile);
            });

            it('should never name an id or leave a placeholder in a message', () => {
                result.diagnostics.forEach(diagnostic => /[{}]|undefined|\[object/.test(diagnostic.message).should.equal(false));
            });
        });
    }
});

describe('when migrating a profile', () => {
    describe('and the input is kept', () => {
        const profile: UiProfile = { name: 'Desktop', targetPlatform: 'web', packages: ['core'], layout: 'OwnShell' };
        const before = JSON.stringify(profile);
        migrateLegacyProfile({ profile }, corpus.library);

        it('should not modify it', () => JSON.stringify(profile).should.equal(before));
    });
});
