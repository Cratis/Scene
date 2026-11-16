// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { effectiveIconCatalogOf } from '../effectiveIconCatalogOf';
import { toIconPickerCatalog } from '../toIconPickerCatalog';
import { diagnoseIconValue } from '../diagnoseIconValue';
import { anIconLibrary } from '../given/anIconLibrary';

describe('when the catalog has not loaded', () => {
    it('should not claim a present icon is missing', () => {
        const effective = effectiveIconCatalogOf(['Acme.Icons'], [anIconLibrary('Acme.Icons', ['home'])]);
        const problem = diagnoseIconValue(effective, toIconPickerCatalog(effective, [], undefined, { status: 'loading' }), { library: 'Acme.Icons', key: 'home' });
        (problem === undefined).should.be.true;
    });
});
