// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { alphaName, betaName, defaultSources, openCatalog } from '../../for_iconFixtures/iconFixtures';

describe('when searching with a variant', () => {
    it('should return a reference per variant the icon exists in', async () => {
        const result = await openCatalog([alphaName, betaName], defaultSources()).search({ text: 'trash' });
        result.entries[0].references.should.deep.equal([
            { library: alphaName, key: 'trash', variant: 'outline' },
            { library: alphaName, key: 'trash', variant: 'solid' },
        ]);
    });

    it('should keep only icons that exist in the requested variant', async () => {
        const result = await openCatalog([alphaName, betaName], defaultSources()).search({ variant: 'solid' });
        result.entries.map((hit) => hit.entry.key).should.deep.equal(['home', 'trash']);
    });
});
