// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { effectiveIconCatalogOf } from '../effectiveIconCatalogOf';
import { toIconPickerCatalog } from '../toIconPickerCatalog';
import { anIconLibrary } from '../given/anIconLibrary';

describe('when the catalog is still loading', () => {
    const effective = effectiveIconCatalogOf(['Acme.Icons'], [anIconLibrary('Acme.Icons', ['home'])]);
    const offered = toIconPickerCatalog(effective, [], undefined, { status: 'loading' });

    it('should say so', () => {
        offered.status!.should.equal('loading');
    });

    it('should still name the libraries', () => {
        offered.libraries.map(library => library.id).should.deep.equal(['Acme.Icons']);
    });
});
