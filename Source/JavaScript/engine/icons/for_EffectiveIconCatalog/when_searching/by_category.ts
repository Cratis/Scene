// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { alphaName, betaName, defaultSources, openCatalog } from '../../for_iconFixtures/iconFixtures';

describe('when searching by category', () => {
    it('should return the icons filed under it from every library', async () => {
        const result = await openCatalog([alphaName, betaName], defaultSources()).search({ category: 'Actions' });
        result.entries.map((hit) => hit.entry.key).should.deep.equal(['trash', 'bin']);
    });

    it('should list the categories in use, sorted', async () => {
        (await openCatalog([alphaName, betaName], defaultSources()).categories()).should.deep.equal(['Actions', 'Buildings', 'Navigation']);
    });
});
