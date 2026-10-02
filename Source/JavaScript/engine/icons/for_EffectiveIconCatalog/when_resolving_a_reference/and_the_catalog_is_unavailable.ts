// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { alphaName, openCatalog } from '../../for_iconFixtures/iconFixtures';

describe('when resolving a reference and the catalog is unavailable', () => {
    it('should report the catalog as unavailable when the library has no source', async () => {
        const result = await openCatalog([alphaName], []).resolve({ library: alphaName, key: 'home' });
        (result.isResolved ? '' : result.diagnostic.kind).should.equal('catalog-unavailable');
    });
});
