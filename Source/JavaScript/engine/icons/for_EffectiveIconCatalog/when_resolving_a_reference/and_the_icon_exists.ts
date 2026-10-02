// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconResolution } from '../../index';
import { alphaName, defaultSources, openCatalog } from '../../for_iconFixtures/iconFixtures';

describe('when resolving a reference and the icon exists', () => {
    let result: IconResolution;

    beforeEach(async () => {
        result = await openCatalog([alphaName], defaultSources()).resolve({ library: alphaName, key: 'trash', variant: 'solid' });
    });

    it('should resolve', () => result.isResolved.should.be.true);
    it('should name the providing library', () => (result.isResolved ? result.library.library : '').should.equal(alphaName));
    it('should return the catalog entry', () => (result.isResolved ? result.entry.name : '').should.equal('Trash'));
});
