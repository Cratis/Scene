// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ScenePackage, UiProfile } from '@cratis/scene.model';
import { MoveDirection, PackageEditOutcome, PackageLockKind, PackageReasonKind, addPackage, chooseBlueprint, chooseTheme, describePackageList, movePackage, removePackage } from '../index';

interface PackageListCase {
    name: string;
    description: string;
    profile: UiProfile;
    action: { kind: string; name?: string; direction?: string; blueprint?: string; shell?: string; theme?: string };
    expected: Record<string, unknown>;
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../package-list-fixtures.json'), 'utf-8')) as { packages: ScenePackage[]; cases: PackageListCase[] };

const camel = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);

const answerOf = (fixture: PackageListCase) => {
    const { action, profile } = fixture;
    if (action.kind === 'describe') {
        const list = describePackageList(profile, corpus.packages);
        return JSON.parse(JSON.stringify({ rows: list.rows.map(row => ({ ...row, kind: row.kind as string })), addable: list.addable.map(item => ({ ...item, kind: item.kind as string })), ...(fixture.expected.suppliers === undefined ? {} : { suppliers: list.suppliers }) }));
    }

    const edit = action.kind === 'add' ? addPackage(profile, corpus.packages, action.name!)
        : action.kind === 'remove' ? removePackage(profile, corpus.packages, action.name!)
            : action.kind === 'move' ? movePackage(profile, corpus.packages, action.name!, action.direction === 'up' ? MoveDirection.Up : MoveDirection.Down)
                : action.kind === 'blueprint' ? chooseBlueprint(profile, corpus.packages, action.blueprint!, action.shell)
                    : chooseTheme(profile, corpus.packages, action.theme!);
    return JSON.parse(JSON.stringify({
        outcome: edit.outcome,
        packages: edit.profile.packages,
        added: edit.added,
        removed: edit.removed,
        message: edit.message,
        ...(edit.profile.root === undefined ? {} : { root: edit.profile.root.template }),
        ...(edit.profile.theme === undefined ? {} : { theme: edit.profile.theme }),
    }));
};

describe('when listing and editing the packages of a profile against the shared fixture corpus', () => {
    it('should have cases in the corpus', () => corpus.cases.length.should.be.greaterThan(25));

    it('should cover every outcome, reason and lock', () => {
        const outcomes = new Set(corpus.cases.filter(fixture => fixture.action.kind !== 'describe').map(fixture => fixture.expected.outcome as string));
        [...outcomes].sort().should.deep.equal(Object.values(PackageEditOutcome).filter(outcome => outcome !== PackageEditOutcome.Unchanged || outcomes.has(outcome)).sort());

        const rows = corpus.cases.flatMap(fixture => (fixture.expected.rows ?? []) as { reason: { kind: string }; lock?: { kind: string } }[]);
        new Set(rows.map(row => row.reason.kind)).should.deep.equal(new Set(Object.values(PackageReasonKind)));
        new Set(rows.flatMap(row => row.lock === undefined ? [] : [row.lock.kind])).should.deep.equal(new Set(Object.values(PackageLockKind)));
    });

    for (const fixture of corpus.cases) {
        describe(`and the case is ${fixture.name}`, () => {
            it('should answer what the corpus expects', () => answerOf(fixture).should.deep.equal(fixture.expected));
        });
    }

    it('should have lower-case camel names for every enum value', () => camel(PackageEditOutcome.Added).should.equal(PackageEditOutcome.Added));
});
