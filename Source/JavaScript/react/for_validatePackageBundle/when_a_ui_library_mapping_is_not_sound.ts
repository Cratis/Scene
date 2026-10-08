// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { corePackage, validatePackageBundle } from '../index';

describe('when a styling bundle declares an invalid Components UI library mapping', () => {
    let problems: string[];
    beforeEach(() => {
        problems = validatePackageBundle({
            ...corePackage,
            manifest: { ...corePackage.manifest, kind: PackageKind.Styling },
            componentsUiLibrary: {
                module: '', exportName: 'renderer', id: 'example', abi: 0,
                profile: 'presentation', requiredSlots: [],
            },
        });
    });
    it('should reject mapping a package that is not a component library', () => problems.should.include('declares a Components UI library mapping but is not of kind ComponentLibrary'));
    it('should validate the module before loading executable frontend code', () => problems.should.include("Components UI library mapping has an empty 'module'"));
    it('should validate the required ABI major', () => problems.should.include('Components UI library mapping requires a positive integer ABI major'));
});
