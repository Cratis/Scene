// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { alphaName, betaName, defaultSources, openCatalog } from '../../for_iconFixtures/iconFixtures';

describe('when resolving a reference and the variant does not exist', () => {
    it('should report a missing variant when the icon has other variants', async () => {
        const result = await openCatalog([alphaName], defaultSources()).resolve({ library: alphaName, key: 'home', variant: 'duotone' });
        (result.isResolved ? '' : result.diagnostic.kind).should.equal('missing-variant');
    });

    it('should report a missing variant when the icon has none', async () => {
        const result = await openCatalog([betaName], defaultSources()).resolve({ library: betaName, key: 'home', variant: 'solid' });
        (result.isResolved ? '' : result.diagnostic.kind).should.equal('missing-variant');
    });
});
