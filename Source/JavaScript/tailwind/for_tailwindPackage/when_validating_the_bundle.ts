// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { validatePackageBundle } from '@cratis/scene.react';
import { tailwindPackage, tailwindPackageManifest } from '../index';

describe('when validating the bundle', () => {
    const problems = validatePackageBundle(tailwindPackage);

    it('should report no problems', () => {
        problems.should.be.empty;
    });

    it('should declare itself a styling package', () => {
        tailwindPackageManifest.kind.should.equal(PackageKind.Styling);
    });

    it('should declare no components, since a styling package contributes none', () => {
        tailwindPackageManifest.components.should.be.empty;
        Object.keys(tailwindPackage.components).should.be.empty;
    });

    it('should declare no dependencies, since nothing has to be active for a CSS system to apply', () => {
        tailwindPackageManifest.dependencies.should.be.empty;
    });

    it('should name the module a host loads it from', () => {
        tailwindPackageManifest.module!.should.equal('@cratis/scene.tailwind');
    });
});
