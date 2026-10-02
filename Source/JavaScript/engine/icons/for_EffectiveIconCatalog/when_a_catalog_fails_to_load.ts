// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconCatalogSource } from '../IconCatalogSource';
import { IconSearchResult } from '../IconSearchResult';
import { alphaEntries, alphaName, betaName, defaultSources, openCatalog } from '../for_iconFixtures/iconFixtures';

describe('when a catalog fails to load', () => {
    let first: IconSearchResult;
    let retry: IconSearchResult;

    beforeEach(async () => {
        let attempts = 0;
        const flaky: IconCatalogSource = {
            library: alphaName,
            loadEntries: async () => {
                attempts++;
                if (attempts === 1) throw new Error('network down');
                return alphaEntries;
            },
        };
        const effective = openCatalog([alphaName, betaName], [flaky, defaultSources()[1]]);
        first = await effective.search({});
        retry = await effective.search({ library: alphaName });
    });

    it('should report the library as unavailable', () => first.diagnostics.map((diagnostic) => [diagnostic.kind, diagnostic.library]).should.deep.equal([['catalog-unavailable', alphaName]]));
    it('should still return the other libraries', () => first.entries.every((hit) => hit.library.library === betaName).should.be.true);
    it('should load again on the next call', () => retry.entries.should.have.length(2));
    it('should report nothing once the load succeeds', () => retry.diagnostics.should.be.empty);
});
