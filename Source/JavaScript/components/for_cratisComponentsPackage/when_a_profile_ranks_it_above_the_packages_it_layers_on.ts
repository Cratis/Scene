// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { PackageCatalog, resolveComponentName } from '@cratis/scene.engine';
import { cratisComponentsPackageManifest } from '../cratisComponentsPackage';

const profile: UiProfile = { name: 'test', targetPlatform: 'web', packages: ['core', 'PrimeReact', 'Cratis.Components'] };

const catalog: PackageCatalog = {
    core: ['text', 'button', 'card'],
    PrimeReact: ['button', 'table', 'dialog'],
    'Cratis.Components': cratisComponentsPackageManifest.components,
};

describe('when a profile ranks it above the packages it layers on', () => {
    describe('and it declares a name PrimeReact also declares', () => {
        const resolution = resolveComponentName('table', profile, catalog)!;

        it('should resolve to this package', () => resolution.package.should.equal('Cratis.Components'));
        it('should record PrimeReact as shadowed rather than discarding it', () => resolution.shadows.should.deep.equal(['PrimeReact']));
    });

    describe('and it declares the dialog name PrimeReact also declares', () => {
        const resolution = resolveComponentName('dialog', profile, catalog)!;

        it('should resolve to the Arc-aware dialog rather than the bare PrimeReact one', () => resolution.package.should.equal('Cratis.Components'));
        it('should record PrimeReact as shadowed', () => resolution.shadows.should.deep.equal(['PrimeReact']));
    });

    describe('and it declares a name nothing else does', () => {
        const resolution = resolveComponentName('dataPage', profile, catalog)!;

        it('should resolve to this package', () => resolution.package.should.equal('Cratis.Components'));
        it('should shadow nothing', () => resolution.shadows.should.deep.equal([]));
    });

    describe('and a name it does not declare is asked for', () => {
        const resolution = resolveComponentName('card', profile, catalog)!;

        it('should fall through to the highest-priority package that does', () => resolution.package.should.equal('core'));
    });

    describe('and a screen qualifies the name with the package explicitly', () => {
        const resolution = resolveComponentName('PrimeReact.table', profile, catalog)!;

        it('should resolve to the named package even though this one outranks it', () => resolution.package.should.equal('PrimeReact'));
    });
});
