// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageEditKind } from '../PackageEditKind';
import { PackageEditOutcome } from '../PackageEditOutcome';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { resolveUiProfile } from '../resolveUiProfile';
import { togglePackage } from '../togglePackage';
import { aStandaloneLibrary, bundlesWith } from '../given/aStandaloneLibrary';

describe('when removing a package nothing needs', () => {
    const bundles = bundlesWith(aStandaloneLibrary('Leaf'));
    let outcome: PackageEditOutcome;

    beforeEach(() => {
        const withLeaf = togglePackage(defaultUiProfileSettings(bundles), 'Leaf', bundles).settings;
        outcome = togglePackage(withLeaf, 'Leaf', bundles);
    });

    it('should remove it', () => {
        outcome.kind.should.equal(PackageEditKind.Removed);
        outcome.settings.packages.should.not.include('Leaf');
    });

    it('should drop it from the resolved profile', () => {
        resolveUiProfile(outcome.settings, bundles).profile.packages.should.not.include('Leaf');
    });
});
