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

/**
 * The base component library `Cratis.Components` wraps, at the version this repository pins.
 *
 * The theme names are drawn from the catalog PrimeReact 11 actually has. Version 11 ships no theme
 * stylesheets at all - a look is a `@primeuix/themes` preset applied at runtime - and the catalog was
 * rebuilt on those presets, so names read `<family>-<light|dark>-<accent>` across the Aura, Lara and Nora
 * families. Several version 10 names (`saga-*`, `vela-*`, `soho-*`, `nano`, `mira` and the rest) have no
 * preset behind them any more and are simply gone; the Lara pair below survived the rebuild, and an Aura
 * pair is listed alongside them so the stub is visibly the version 11 catalog rather than a version 10
 * remnant that happens to still be valid.
 */
const primeReact: ScenePackage = {
    name: 'PrimeReact',
    version: '11.1.0',
    kind: PackageKind.ComponentLibrary,
    dependencies: [{ name: 'Tailwind' }],
    components: ['button', 'table', 'dialog'],
    layouts: [],
    screenTemplates: [],
    dialogTemplates: [],
    themes: ['aura-light-blue', 'aura-dark-blue', 'lara-light-blue', 'lara-dark-blue'],
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

    describe('and PrimeReact is older than the major version the library is built against', () => {
        const older = resolvePackageDependencies(['Cratis.Components'], [tailwind, { ...primeReact, version: '10.9.8' }, cratisComponentsPackageManifest]);

        it('should report the version conflict', () =>
            older.versionConflicts.should.deep.equal([
                { package: 'Cratis.Components', dependsOn: 'PrimeReact', requiredRange: '>=11.0.0', actualVersion: '10.9.8' },
            ]));
    });
});
