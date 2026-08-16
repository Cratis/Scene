// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { corePackage, validatePackageBundle } from '../index';

describe('when the bundle matches its manifest', () => {
    const problems = validatePackageBundle(corePackage);

    it('should report no problems', () => {
        problems.should.be.empty;
    });
});
