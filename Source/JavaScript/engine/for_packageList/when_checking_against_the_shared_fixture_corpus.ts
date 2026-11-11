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
    packages?: ScenePackage[];
    action: { kind: string; name?: string; direction?: string; blueprint?: string; shell?: string; theme?: string };
    expected: Record<string, unknown>;
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../package-list-fixtures.json'), 'utf-8')) as { packages: ScenePackage[]; cases: PackageListCase[] };

const pristine = { catalog: JSON.stringify(corpus.packages), cases: JSON.stringify(corpus.cases.map(fixture => ({ profile: fixture.profile, packages: fixture.packages }))) };

const camel = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);

const answerOf = (fixture: PackageListCase, profile: UiProfile = fixture.profile, packages: ScenePackage[] = fixture.packages ?? corpus.packages) => {
    const { action } = fixture;
    if (action.kind === 'describe') {
        const list = describePackageList(profile, packages);
        return JSON.parse(JSON.stringify({ rows: list.rows.map(row => ({ ...row, kind: row.kind as string })), addable: list.addable.map(item => ({ ...item, kind: item.kind as string })), ...(fixture.expected.suppliers === undefined ? {} : { suppliers: list.suppliers }) }));
    }

    const edit = action.kind === 'add' ? addPackage(profile, packages, action.name!)
        : action.kind === 'remove' ? removePackage(profile, packages, action.name!)
            : action.kind === 'move' ? movePackage(profile, packages, action.name!, action.direction === 'up' ? MoveDirection.Up : MoveDirection.Down)
                : action.kind === 'blueprint' ? chooseBlueprint(profile, packages, action.blueprint!, action.shell)
                    : chooseTheme(profile, packages, action.theme!);
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

    it('should leave the profile and the catalog as they were', () => {
        corpus.cases.forEach(fixture => answerOf(fixture));

        JSON.stringify(corpus.cases.map(fixture => ({ profile: fixture.profile, packages: fixture.packages }))).should.equal(pristine.cases);
        JSON.stringify(corpus.packages).should.equal(pristine.catalog);
    });

    it('should write the listing the way the designer reads it', () => {
        const fixture = corpus.cases.find(candidate => candidate.name === 'a package another needs')!;
        JSON.stringify(describePackageList(fixture.profile, corpus.packages)).should.equal("{\"rows\":[{\"position\":1,\"name\":\"material\",\"displayName\":\"Material Components\",\"version\":\"1.0.0\",\"kind\":\"ComponentLibrary\",\"description\":\"Material components.\",\"reason\":{\"kind\":\"chosen\",\"packages\":[],\"text\":\"Chosen\"},\"canMoveUp\":false,\"canMoveDown\":false},{\"position\":2,\"name\":\"tailwind\",\"displayName\":\"Tailwind\",\"version\":\"1.0.0\",\"kind\":\"Styling\",\"description\":\"Utility styling.\",\"reason\":{\"kind\":\"neededBy\",\"packages\":[\"Material Components\"],\"text\":\"Needed by Material Components\"},\"canMoveUp\":false,\"canMoveDown\":true,\"lock\":{\"kind\":\"neededBy\",\"packages\":[\"Material Components\"],\"text\":\"Tailwind is needed by Material Components, so it stays while they are listed.\"}},{\"position\":3,\"name\":\"primereact\",\"displayName\":\"PrimeReact\",\"version\":\"1.0.0\",\"kind\":\"ComponentLibrary\",\"description\":\"PrimeReact components.\",\"reason\":{\"kind\":\"chosen\",\"packages\":[],\"text\":\"Chosen\"},\"canMoveUp\":true,\"canMoveDown\":false},{\"position\":4,\"name\":\"core\",\"displayName\":\"Core\",\"version\":\"1.0.0\",\"kind\":\"ComponentLibrary\",\"description\":\"The fallback components.\",\"reason\":{\"kind\":\"alwaysLast\",\"packages\":[],\"text\":\"Always last\"},\"canMoveUp\":false,\"canMoveDown\":false,\"lock\":{\"kind\":\"core\",\"packages\":[],\"text\":\"Core is the fallback every component name resolves against, so it is always last and cannot be removed.\"}}],\"addable\":[{\"name\":\"material-themes\",\"displayName\":\"Material Themes\",\"version\":\"1.0.0\",\"kind\":\"Styling\",\"description\":\"Material themes.\",\"alsoAdds\":[],\"text\":\"\"},{\"name\":\"bp.default\",\"displayName\":\"Cratis Default\",\"version\":\"1.4.2\",\"kind\":\"Blueprint\",\"description\":\"The default blueprint.\",\"alsoAdds\":[],\"text\":\"\"},{\"name\":\"bp.dashboard\",\"displayName\":\"Dashboard\",\"version\":\"2.0.0\",\"kind\":\"Blueprint\",\"description\":\"Horizontal navigation.\",\"alsoAdds\":[],\"text\":\"\"},{\"name\":\"broken\",\"displayName\":\"Broken\",\"version\":\"1.0.0\",\"kind\":\"ComponentLibrary\",\"description\":\"Needs a package nobody has.\",\"alsoAdds\":[],\"text\":\"\"}],\"suppliers\":[{\"component\":\"button\",\"winner\":\"material\",\"others\":[\"primereact\",\"core\"]},{\"component\":\"card\",\"winner\":\"primereact\",\"others\":[\"core\"]},{\"component\":\"datatable\",\"winner\":\"material\",\"others\":[\"primereact\"]},{\"component\":\"table\",\"winner\":\"core\",\"others\":[]}]}");
    });

    it('should write an edit with what it added in the order it added it', () => {
        const fixture = corpus.cases.find(candidate => candidate.name === 'choose a theme whose package is missing')!;
        JSON.stringify(chooseTheme(fixture.profile, corpus.packages, 'Material Ocean')).should.equal("{\"profile\":{\"name\":\"Desktop\",\"targetPlatform\":\"web\",\"packages\":[\"core\",\"tailwind\",\"material\",\"material-themes\",\"primereact\"],\"theme\":\"Material Ocean\"},\"outcome\":\"changed\",\"added\":[\"tailwind\",\"material\",\"material-themes\"],\"removed\":[],\"message\":\"Theme 'Material Ocean' needs Material Themes, which was added.\"}");
    });

    it('should have lower-case camel names for every enum value', () => camel(PackageEditOutcome.Added).should.equal(PackageEditOutcome.Added));
});
