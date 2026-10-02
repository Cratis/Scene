// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { alphaName, betaName, defaultSources, openCatalog } from '../../for_iconFixtures/iconFixtures';

describe('when searching narrowed to one library', () => {
    let sources: ReturnType<typeof defaultSources>;
    let keys: string[];

    beforeEach(async () => {
        sources = defaultSources();
        const result = await openCatalog([alphaName, betaName], sources).search({ library: betaName });
        keys = result.entries.map((hit) => hit.entry.key);
    });

    it('should return only that library\'s icons', () => keys.should.deep.equal(['home', 'bin']));
    it('should load only that library\'s catalog', () => sources.map((source) => source.loads).should.deep.equal([0, 1]));
});
