// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { effectiveIconCatalogOf } from '../../Icons/effectiveIconCatalogOf';
import { aLibraryNeedingIcons } from '../given/aLibraryNeedingIcons';
import { bundlesWith } from '../given/aStandaloneLibrary';
import { anIconLibrary } from '../../Icons/given/anIconLibrary';

describe('when the icon library is at an incompatible version', () => {
    const bundles = bundlesWith(anIconLibrary('Acme.Icons', ['home'], { version: '2.0.0' }), aLibraryNeedingIcons('^1.0.0'));

    it('should report an incompatible version for that library', () => {
        const diagnostics = effectiveIconCatalogOf(['Needy'], bundles).diagnostics;
        diagnostics.map(diagnostic => `${diagnostic.kind}:${diagnostic.library}`).should.deep.equal(['incompatible-version:Acme.Icons']);
    });
});
