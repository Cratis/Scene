// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cratisComponentsPackageManifest } from '../cratisComponentsPackage';

describe('when describing query arguments', () => {
    it('should keep both collection table names in the manifest', () => {
        cratisComponentsPackageManifest.components.should.include('dataTable');
        cratisComponentsPackageManifest.components.should.include('table');
    });

    it('should describe the optional object property without promising single-result support', () => {
        (cratisComponentsPackageManifest.description ?? '').should.contain('dataTable and table accept optional object-valued queryArguments for collection queries');
    });
});
