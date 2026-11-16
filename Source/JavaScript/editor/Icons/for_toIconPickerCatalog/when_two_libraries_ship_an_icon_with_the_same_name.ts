// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconPickerCatalog, IconPickerValue } from '@cratis/components/IconPicker';
import { EffectiveIconCatalog, EffectiveIconEntry } from '@cratis/scene.engine';
import { IconReference, formatIconReference, iconReferencesEqual, parseIconReference } from '@cratis/scene.model';
import { effectiveIconCatalogOf } from '../effectiveIconCatalogOf';
import { toIconPickerCatalog } from '../toIconPickerCatalog';
import { anIconLibrary } from '../given/anIconLibrary';

describe('when two libraries ship an icon with the same name', () => {
    const bundles = [anIconLibrary('Acme.Icons', ['home', 'trash']), anIconLibrary('Other.Icons', ['home'])];
    let effective: EffectiveIconCatalog;
    let entries: EffectiveIconEntry[];
    let offered: IconPickerCatalog;

    beforeEach(async () => {
        effective = effectiveIconCatalogOf(['Acme.Icons', 'Other.Icons'], bundles);
        entries = (await effective.search()).entries;
        offered = toIconPickerCatalog(effective, entries);
    });

    it('should offer one entry per library, not one per name', () => {
        offered.icons.filter(icon => icon.key === 'home').map(icon => icon.library).should.have.members(['Acme.Icons', 'Other.Icons']);
    });

    it('should offer both libraries as providers', () => {
        offered.libraries.map(library => library.id).should.have.members(['Acme.Icons', 'Other.Icons']);
    });

    it('should pass library and key through unchanged', () => {
        offered.icons.map(icon => `${icon.library}/${icon.key}`).should.have.members(['Acme.Icons/home', 'Acme.Icons/trash', 'Other.Icons/home']);
    });

    it('should keep the choice distinct through select, serialize and parse', async () => {
        const chosen: IconPickerValue = offered.icons.find(icon => icon.library === 'Other.Icons' && icon.key === 'home')!;
        const emitted: IconReference = { library: chosen.library, key: chosen.key };
        const stored = JSON.stringify(emitted);
        const reopened = JSON.parse(stored) as IconReference;
        const resolution = await effective.resolve(reopened);

        iconReferencesEqual(reopened, emitted).should.be.true;
        (resolution.isResolved && resolution.library.library).should.equal('Other.Icons');
        parseIconReference(formatIconReference(reopened))!.library.should.equal('Other.Icons');
    });

    it('should not equate the two icons', () => {
        iconReferencesEqual({ library: 'Acme.Icons', key: 'home' }, { library: 'Other.Icons', key: 'home' }).should.be.false;
    });

    it('should report the catalog as ready', () => {
        offered.status!.should.equal('ready');
    });
});
