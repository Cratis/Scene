// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { diagnoseIconValue } from '../diagnoseIconValue';
import { aLoadedCatalog } from '../given/aLoadedCatalog';

describe('when the icon resolves', () => {
    it('should report no problem', async () => {
        const { effective, offered } = await aLoadedCatalog();
        (diagnoseIconValue(effective, offered, { library: 'Acme.Icons', key: 'home' }) === undefined).should.be.true;
    });

    it('should report nothing for an empty field', async () => {
        const { effective, offered } = await aLoadedCatalog();
        (diagnoseIconValue(effective, offered, undefined) === undefined).should.be.true;
    });
});
