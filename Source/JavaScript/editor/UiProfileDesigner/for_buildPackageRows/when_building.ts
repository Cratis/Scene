// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageGroupId } from '../../UiProfile/PackageGroupId';
import { PackageInclusion } from '../../UiProfile/PackageInclusion';
import { defaultUiProfileSettings } from '../../UiProfile/defaultUiProfileSettings';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import { aStandaloneLibrary, bundlesWith } from '../../UiProfile/given/aStandaloneLibrary';
import { buildPackageRows } from '../PackageList/buildPackageRows';

describe('when building the package rows of the default profile', () => {
    const bundles = bundlesWith();
    const settings = defaultUiProfileSettings(bundles);
    const rows = buildPackageRows(settings, resolveUiProfile(settings, bundles), bundles);
    const row = (name: string) => rows.find(candidate => candidate.name === name)!;

    it('should list the package that wins a shared name first, and core last', () => {
        rows[0].name.should.equal('Cratis.Blueprint.Default');
        rows[rows.length - 1].name.should.equal('core');
    });
    it('should count the priority from the top', () => rows.map(candidate => candidate.priority).should.deep.equal(rows.map((_, index) => index + 1)));
    it('should name what each package is for', () => {
        row('PrimeReact').role!.should.equal(PackageGroupId.ComponentLibraries);
        row('Tailwind').role!.should.equal(PackageGroupId.Styling);
        row('Cratis.Blueprint.Default').role!.should.equal(PackageGroupId.Blueprints);
    });
    it('should say how a package came to be there', () => {
        row('core').inclusion.should.equal(PackageInclusion.Fallback);
        row('PrimeReact').inclusion.should.equal(PackageInclusion.Explicit);
        row('Cratis.Components').inclusion.should.equal(PackageInclusion.Automatic);
    });
    it('should say who needs a package', () => row('Cratis.Components').requiredBy.should.deep.equal(['Cratis.Blueprint.Default']));
    it('should mark the shell', () => row('Cratis.Blueprint.Default').isShell.should.be.true);
    it('should treat a package the author chose as one that can be removed here', () => row('PrimeReact').isPackage.should.be.true);
    it('should not treat core, the shell or a package another one pulled in as chosen', () => {
        row('core').isPackage.should.be.false;
        row('Cratis.Blueprint.Default').isPackage.should.be.false;
        row('Cratis.Components').isPackage.should.be.false;
    });
    it('should not let core or a package pulled in be moved', () => {
        [row('core'), row('Cratis.Components')].forEach(candidate => { candidate.canRaise.should.be.false; candidate.canLower.should.be.false; });
    });
});

describe('when building the package rows with a package the author added', () => {
    const bundles = bundlesWith(aStandaloneLibrary('Leaf', ['leafWidget']));
    const settings = { ...defaultUiProfileSettings(bundles), packages: ['PrimeReact', 'Tailwind', 'Leaf'] };
    const rows = buildPackageRows(settings, resolveUiProfile(settings, bundles), bundles);
    const row = (name: string) => rows.find(candidate => candidate.name === name)!;

    it('should rank every package as the resolver orders them, the strongest first', () => rows.map(candidate => candidate.name).should.deep.equal([...resolveUiProfile(settings, bundles).entries].reverse().map(entry => entry.name)));
    it('should allow it to be lowered', () => row('Leaf').canLower.should.be.true);
    it('should not allow it to be raised past the top', () => row('Leaf').canRaise.should.be.false);
});
