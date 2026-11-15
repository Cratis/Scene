// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageEditKind } from '../PackageEditKind';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { togglePackage } from '../togglePackage';
import { bundlesWith } from '../given/aStandaloneLibrary';
import { anIconLibrary } from '../../Icons/given/anIconLibrary';

describe('when adding and removing an icon library', () => {
    const bundles = bundlesWith(anIconLibrary('Acme.Icons', ['home']));
    const base = defaultUiProfileSettings(bundles);
    const added = togglePackage(base, 'Acme.Icons', bundles);
    const removed = togglePackage(added.settings, 'Acme.Icons', bundles);

    it('should add it as an explicit package', () => {
        added.kind.should.equal(PackageEditKind.Added);
        added.settings.packages.should.contain('Acme.Icons');
    });

    it('should remove it again, leaving the profile as it was', () => {
        removed.kind.should.equal(PackageEditKind.Removed);
        removed.settings.packages.should.deep.equal(base.packages);
    });
});
