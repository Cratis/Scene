// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { alphaName, betaName, defaultSources, openCatalog } from '../../for_iconFixtures/iconFixtures';

describe('when resolving a reference and the library is not active', () => {
    it('should report a missing library, even though another library has the same key', async () => {
        const result = await openCatalog([alphaName], defaultSources()).resolve({ library: betaName, key: 'home' });
        result.isResolved.should.be.false;
        (result.isResolved ? '' : result.diagnostic.kind).should.equal('missing-library');
    });
});
