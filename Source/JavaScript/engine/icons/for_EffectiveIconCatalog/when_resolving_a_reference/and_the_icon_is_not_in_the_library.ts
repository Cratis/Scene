// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { alphaName, defaultSources, openCatalog } from '../../for_iconFixtures/iconFixtures';

describe('when resolving a reference and the icon is not in the library', () => {
    it('should report a missing icon, even though another active library has that key', async () => {
        const result = await openCatalog([alphaName], defaultSources()).resolve({ library: alphaName, key: 'bin' });
        (result.isResolved ? '' : result.diagnostic.kind).should.equal('missing-icon');
    });
});
