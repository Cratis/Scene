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

describe('when resolving its dependencies', () => {
    const catalog = [tailwind, cratisComponentsPackageManifest];
    const selection = resolvePackageDependencies(['Cratis.Components'], catalog);

    it('should order every package it depends on before it', () =>
        selection.packages.should.deep.equal(['Tailwind', 'Cratis.Components']));

    it('should report the packages it pulls in on the caller behalf', () => selection.added.should.deep.equal(['Tailwind']));
    it('should report nothing missing', () => selection.missing.should.deep.equal([]));
    it('should report no version conflict', () => selection.versionConflicts.should.deep.equal([]));
    it('should report no cycle', () => selection.cycles.should.deep.equal([]));
    it('should not pull PrimeReact in', () => selection.packages.should.not.include('PrimeReact'));
    it('should be a valid selection', () => isPackageSelectionValid(selection).should.be.true);

    describe('and Tailwind is not in the catalog', () => {
        const withoutDependencies = resolvePackageDependencies(['Cratis.Components'], [cratisComponentsPackageManifest]);

        it('should report it as missing rather than silently ordering around them', () =>
            withoutDependencies.missing.should.deep.equal([
                { package: 'Cratis.Components', dependsOn: 'Tailwind' },
            ]));
    });
});
