// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { alphaName, betaName, defaultSources, openCatalog } from '../../for_iconFixtures/iconFixtures';

describe('when resolving a reference and two libraries share the key', () => {
    it('should resolve each reference to its own library without precedence', async () => {
        const effective = openCatalog([alphaName, betaName], defaultSources());
        const fromAlpha = await effective.resolve({ library: alphaName, key: 'home' });
        const fromBeta = await effective.resolve({ library: betaName, key: 'home' });

        (fromAlpha.isResolved ? fromAlpha.entry.categories : []).should.deep.equal(['Navigation']);
        (fromBeta.isResolved ? fromBeta.entry.categories : []).should.deep.equal(['Buildings']);
    });
});
