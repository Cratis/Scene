// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconPickerCatalog } from '@cratis/components/IconPicker';
import { effectiveIconCatalogOf } from '../effectiveIconCatalogOf';
import { toIconPickerCatalog } from '../toIconPickerCatalog';
import { anIconLibrary } from '../given/anIconLibrary';

describe('when an icon has variants', () => {
    let offered: IconPickerCatalog;

    beforeEach(async () => {
        const effective = effectiveIconCatalogOf(['Acme.Icons'], [anIconLibrary('Acme.Icons', ['home'], { variants: ['outline', 'solid'] })]);
        offered = toIconPickerCatalog(effective, (await effective.search()).entries);
    });

    it('should offer one entry per variant', () => {
        offered.icons.map(icon => icon.variant).should.have.members(['outline', 'solid']);
    });

    it('should carry the variant in the identity, not the name', () => {
        new Set(offered.icons.map(icon => icon.name)).size.should.equal(1);
    });
});
