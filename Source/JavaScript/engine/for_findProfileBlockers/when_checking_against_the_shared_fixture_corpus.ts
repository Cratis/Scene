// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ScenePackage, Theme, UiProfile } from '@cratis/scene.model';
import { ProfileBlockerCode, ProfileUsage, TemplateLibrary, findProfileBlockers, resolveEffectiveShell } from '../index';

interface BlockerCase {
    name: string;
    description: string;
    profile: UiProfile;
    theme: Theme | null;
    usages: ProfileUsage[];
    expected: { code: string; subject: string; message: string; shellCode: string | null }[];
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../profile-blockers-fixtures.json'), 'utf-8')) as {
    libraries: { default: TemplateLibrary };
    packages: ScenePackage[];
    cases: BlockerCase[];
};

const blockersOf = (fixture: BlockerCase) => {
    const library = corpus.libraries.default;
    const shell = resolveEffectiveShell(fixture.profile, { library });
    return findProfileBlockers(fixture.profile, { packages: corpus.packages, library, theme: fixture.theme ?? undefined, shell, usages: fixture.usages })
        .map(blocker => ({ code: blocker.code as string, subject: blocker.subject, message: blocker.message, shellCode: blocker.shellCode ?? null }));
};

describe('when finding what stops a profile against the shared fixture corpus', () => {
    it('should have cases in the corpus', () => corpus.cases.length.should.be.greaterThan(15));

    it('should cover every blocker code', () => {
        const covered = new Set(corpus.cases.flatMap(fixture => fixture.expected.map(blocker => blocker.code)));
        [...covered].sort().should.deep.equal(Object.values(ProfileBlockerCode).sort());
    });

    it('should never show an id or leave a placeholder in a message', () => {
        const messages = corpus.cases.flatMap(fixture => blockersOf(fixture).map(blocker => blocker.message));
        messages.filter(message => /[{}]|undefined|null|\b[0-9a-f]{8}-[0-9a-f]{4}-/.test(message)).should.deep.equal([]);
    });

    for (const fixture of corpus.cases) {
        describe(`and the case is ${fixture.name}`, () => {
            it('should find what the corpus expects, in order', () => blockersOf(fixture).should.deep.equal(fixture.expected));
        });
    }
});
