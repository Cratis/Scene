// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageEditKind } from '../PackageEditKind';
import { PackageEditOutcome } from '../PackageEditOutcome';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { togglePackage } from '../togglePackage';
import { aStandaloneLibrary, bundlesWith } from '../given/aStandaloneLibrary';

describe('when adding a package', () => {
    const bundles = bundlesWith(aStandaloneLibrary('Leaf'));
    let outcome: PackageEditOutcome;

    beforeEach(() => {
        outcome = togglePackage(defaultUiProfileSettings(bundles), 'Leaf', bundles);
    });

    it('should report it as added', () => {
        outcome.kind.should.equal(PackageEditKind.Added);
    });

    it('should give it the highest priority among the chosen packages', () => {
        outcome.settings.packages.should.deep.equal(['PrimeReact', 'Tailwind', 'Leaf']);
    });
});
