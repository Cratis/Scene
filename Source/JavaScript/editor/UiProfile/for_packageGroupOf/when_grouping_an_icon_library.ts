// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageGroupId } from '../PackageGroupId';
import { packageGroupOf } from '../packageGroupOf';
import { anIconLibrary } from '../../Icons/given/anIconLibrary';

describe('when grouping an icon library', () => {
    it('should put it in the icon libraries group', () => {
        packageGroupOf(anIconLibrary('Acme.Icons', ['home']).manifest)!.id.should.equal(PackageGroupId.IconLibraries);
    });
});
