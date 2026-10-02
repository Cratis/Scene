// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { alphaName, betaName, defaultSources, openCatalog } from '../for_iconFixtures/iconFixtures';

describe('when opened', () => {
    const sources = defaultSources();
    const effective = openCatalog([alphaName, betaName], sources);

    it('should list the active libraries without loading any catalog', () => {
        effective.libraries.should.have.length(2);
        sources.every((source) => source.loads === 0).should.be.true;
    });

    it('should not consider any library loaded', () => effective.isLoaded(alphaName).should.be.false);
});
