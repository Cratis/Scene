// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { betaName, componentsNeedingNewerBeta, defaultSources, openCatalog } from '../../for_iconFixtures/iconFixtures';

describe('when resolving a reference and the library version is incompatible', () => {
    it('should report the incompatible version rather than resolve', async () => {
        const result = await openCatalog([componentsNeedingNewerBeta.name], defaultSources()).resolve({ library: betaName, key: 'home' });
        (result.isResolved ? '' : result.diagnostic.kind).should.equal('incompatible-version');
    });
});
