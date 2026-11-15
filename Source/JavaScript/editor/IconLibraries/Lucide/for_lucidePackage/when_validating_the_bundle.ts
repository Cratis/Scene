// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { validatePackageBundle } from '@cratis/scene.react';
import installed from 'lucide-react/package.json';
import { lucidePackage } from '../lucidePackage';

describe('when validating the Lucide bundle', () => {
    it('should find nothing wrong with manifest and bundle', () => {
        validatePackageBundle(lucidePackage).should.be.empty;
    });

    it('should carry the version of the lucide-react release it wraps', () => {
        lucidePackage.manifest.version.should.equal(installed.version);
    });

    it('should state a license that allows redistribution', () => {
        lucidePackage.manifest.license!.should.equal('ISC');
    });
});
