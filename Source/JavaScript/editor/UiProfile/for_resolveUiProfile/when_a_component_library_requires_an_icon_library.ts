// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { effectiveIconCatalogOf } from '../../Icons/effectiveIconCatalogOf';
import { PackageInclusion } from '../PackageInclusion';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { resolveUiProfile } from '../resolveUiProfile';
import { aLibraryNeedingIcons } from '../given/aLibraryNeedingIcons';
import { bundlesWith } from '../given/aStandaloneLibrary';
import { anIconLibrary } from '../../Icons/given/anIconLibrary';

describe('when a component library requires an icon library', () => {
    const bundles = bundlesWith(anIconLibrary('Acme.Icons', ['home'], { version: '1.2.0' }), aLibraryNeedingIcons('^1.0.0'));
    const resolved = resolveUiProfile({ ...defaultUiProfileSettings(bundles), packages: ['Needy'] }, bundles);
    const entry = resolved.entries.find(candidate => candidate.name === 'Acme.Icons')!;

    it('should include the icon library automatically', () => {
        entry.inclusion.should.equal(PackageInclusion.Automatic);
    });

    it('should say which package needs it', () => {
        entry.requiredBy.should.deep.equal(['Needy']);
    });

    it('should open its effective catalog without a problem', () => {
        effectiveIconCatalogOf(resolved.selection.packages, bundles).diagnostics.should.be.empty;
    });
});
