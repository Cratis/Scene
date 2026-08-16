// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { componentRegistryKey, validatePackageBundle } from '@cratis/scene.react';
import { cratisComponentsPackage, cratisComponentsPackageManifest } from '../cratisComponentsPackage';
import { cratisComponentsPackageName } from '../cratisComponents';

describe('when validating the bundle', () => {
    const problems = validatePackageBundle(cratisComponentsPackage);

    it('should report no problems', () => problems.should.deep.equal([]));

    it('should register an implementation for every declared component', () => {
        const missing = cratisComponentsPackageManifest.components.filter(
            name => !(componentRegistryKey(cratisComponentsPackageName, name) in cratisComponentsPackage.components)
        );
        missing.should.deep.equal([]);
    });

    it('should key every registration under this package name', () => {
        const foreign = Object.keys(cratisComponentsPackage.components).filter(key => !key.startsWith(`${cratisComponentsPackageName}:`));
        foreign.should.deep.equal([]);
    });

    it('should declare every registered component', () => {
        const declared = new Set(cratisComponentsPackageManifest.components);
        const undeclared = Object.keys(cratisComponentsPackage.components).filter(
            key => !declared.has(key.slice(`${cratisComponentsPackageName}:`.length))
        );
        undeclared.should.deep.equal([]);
    });

    it('should declare no layouts, screen templates, dialog templates or themes', () => {
        cratisComponentsPackageManifest.layouts.should.deep.equal([]);
        cratisComponentsPackageManifest.screenTemplates.should.deep.equal([]);
        cratisComponentsPackageManifest.dialogTemplates.should.deep.equal([]);
        cratisComponentsPackageManifest.themes.should.deep.equal([]);
    });
});
