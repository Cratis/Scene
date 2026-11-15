// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { PackageEditKind } from '../PackageEditKind';
import { PackageEditOutcome } from '../PackageEditOutcome';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { resolveUiProfile } from '../resolveUiProfile';
import { PackageInclusion } from '../PackageInclusion';
import { togglePackage } from '../togglePackage';

describe('when removing a chosen package another package needs', () => {
    let outcome: PackageEditOutcome;

    beforeEach(() => {
        outcome = togglePackage(defaultUiProfileSettings(blueprintPreviewBundles), 'Tailwind', blueprintPreviewBundles);
    });

    it('should stop choosing it', () => {
        outcome.settings.packages.should.not.include('Tailwind');
    });

    it('should report that it stays because of a requirement', () => {
        outcome.kind.should.equal(PackageEditKind.RemovedButStillRequired);
    });

    it('should say which packages require it', () => {
        outcome.requiredBy.should.deep.equal(['PrimeReact', 'Cratis.Components']);
    });

    it('should keep it in the profile as an automatic inclusion', () => {
        resolveUiProfile(outcome.settings, blueprintPreviewBundles).entries.find(entry => entry.name === 'Tailwind')!.inclusion.should.equal(PackageInclusion.Automatic);
    });
});
