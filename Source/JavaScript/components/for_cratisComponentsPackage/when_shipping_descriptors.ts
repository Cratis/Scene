// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { validatePackageBundle } from '@cratis/scene.react';
import { cratisComponentsDescriptors, cratisComponentsPackage } from '../index';

describe('when shipping descriptors', () => {
    it('should ship them with the bundle', () => {
        (cratisComponentsPackage.descriptors === cratisComponentsDescriptors).should.be.true;
    });

    it('should describe only components the manifest declares', () => {
        validatePackageBundle(cratisComponentsPackage).should.be.empty;
    });
});
