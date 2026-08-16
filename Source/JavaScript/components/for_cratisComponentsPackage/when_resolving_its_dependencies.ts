// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { isPackageSelectionValid, resolvePackageDependencies } from '@cratis/scene.engine';
import { cratisComponentsPackageManifest } from '../cratisComponentsPackage';

/**
 * A styling package declaring nothing but itself - enough for `Cratis.Components` to depend on, and no
 * more, so this spec fails only when *this* package's declaration is wrong.
 */
const tailwind: ScenePackage = {
    name: 'Tailwind',
    version: '4.3.3',
    kind: PackageKind.Styling,
    dependencies: [],
    components: [],
    layouts: [],
    screenTemplates: [],
    dialogTemplates: [],
    themes: [],
};

/** The base component library `Cratis.Components` wraps, at the version this repository pins. */
const primeReact: ScenePackage = {
    name: 'PrimeReact',
    version: '10.9.8',
    kind: PackageKind.ComponentLibrary,
    dependencies: [{ name: 'Tailwind' }],
    components: ['button', 'table', 'dialog'],
    layouts: [],
    screenTemplates: [],
    dialogTemplates: [],
    themes: ['lara-light-blue', 'lara-dark-blue'],
};

describe('when resolving its dependencies', () => {
    const catalog = [tailwind, primeReact, cratisComponentsPackageManifest];
    const selection = resolvePackageDependencies(['Cratis.Components'], catalog);

    it('should order every package it depends on before it', () =>
        selection.packages.should.deep.equal(['Tailwind', 'PrimeReact', 'Cratis.Components']));

    it('should report the packages it pulls in on the caller behalf', () => selection.added.should.deep.equal(['Tailwind', 'PrimeReact']));
    it('should report nothing missing', () => selection.missing.should.deep.equal([]));
    it('should report no version conflict', () => selection.versionConflicts.should.deep.equal([]));
    it('should report no cycle', () => selection.cycles.should.deep.equal([]));
    it('should be a valid selection', () => isPackageSelectionValid(selection).should.be.true);

    describe('and neither dependency is in the catalog', () => {
        const withoutDependencies = resolvePackageDependencies(['Cratis.Components'], [cratisComponentsPackageManifest]);

        it('should report both as missing rather than silently ordering around them', () =>
            withoutDependencies.missing.should.deep.equal([
                { package: 'Cratis.Components', dependsOn: 'PrimeReact' },
                { package: 'Cratis.Components', dependsOn: 'Tailwind' },
            ]));
    });

    describe('and PrimeReact is older than the range the token layer needs', () => {
        const older = resolvePackageDependencies(['Cratis.Components'], [tailwind, { ...primeReact, version: '10.8.0' }, cratisComponentsPackageManifest]);

        it('should report the version conflict', () =>
            older.versionConflicts.should.deep.equal([
                { package: 'Cratis.Components', dependsOn: 'PrimeReact', requiredRange: '>=10.9.0', actualVersion: '10.8.0' },
            ]));
    });
});
