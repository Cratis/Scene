// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { alphaName, betaName, defaultSources, openCatalog } from '../../for_iconFixtures/iconFixtures';

describe('when searching with text', () => {
    it('should match aliases and tags across libraries, keeping the library of each hit', async () => {
        const result = await openCatalog([alphaName, betaName], defaultSources()).search({ text: 'BIN' });
        result.entries.map((hit) => `${hit.library.library}:${hit.entry.key}`).should.deep.equal([`${alphaName}:trash`, `${betaName}:bin`]);
    });
});
