// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { alphaName, defaultSources, openCatalog } from '../../for_iconFixtures/iconFixtures';

describe('when resolving a reference and the variant is not given', () => {
    it('should resolve to the icon, leaving the variant to the library default', async () => {
        const result = await openCatalog([alphaName], defaultSources()).resolve({ library: alphaName, key: 'home' });
        result.isResolved.should.be.true;
    });
});
