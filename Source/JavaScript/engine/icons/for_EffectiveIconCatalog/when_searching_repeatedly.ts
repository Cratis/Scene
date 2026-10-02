// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { alphaName, betaName, defaultSources, openCatalog } from '../for_iconFixtures/iconFixtures';

describe('when searching repeatedly', () => {
    let sources: ReturnType<typeof defaultSources>;

    beforeEach(async () => {
        sources = defaultSources();
        const effective = openCatalog([alphaName, betaName], sources);
        await effective.search({});
        await effective.search({ text: 'home' });
    });

    it('should load each catalog once', () => sources.map((source) => source.loads).should.deep.equal([1, 1]));
});
