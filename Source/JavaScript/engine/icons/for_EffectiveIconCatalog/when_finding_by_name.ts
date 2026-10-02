// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { alphaName, betaName, defaultSources, openCatalog } from '../for_iconFixtures/iconFixtures';

describe('when finding by name', () => {
    it('should return every library\'s icon of that name rather than choosing one', async () => {
        const hits = await openCatalog([alphaName, betaName], defaultSources()).findByName('home');
        hits.map((hit) => hit.library.library).should.deep.equal([alphaName, betaName]);
    });

    it('should return nothing for an unknown name', async () => {
        (await openCatalog([alphaName], defaultSources()).findByName('rocket')).should.be.empty;
    });
});
