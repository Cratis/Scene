// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { validatePackageBundle } from '@cratis/scene.react';
import { primeReactPackage } from '../primeReactPackage';

describe('when validating the bundle', () => {
    let problems: string[];

    beforeEach(() => {
        problems = validatePackageBundle(primeReactPackage);
    });

    it('should report no problems', () => {
        problems.should.deep.equal([]);
    });
});
