// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconValueProblem } from '../IconValueProblem';
import { diagnoseIconValue } from '../diagnoseIconValue';
import { aLoadedCatalog } from '../given/aLoadedCatalog';

describe('when the library was removed from the profile', () => {
    let problem: IconValueProblem | undefined;
    const stored = { library: 'Retired.Icons', key: 'home' };

    beforeEach(async () => {
        const { effective, offered } = await aLoadedCatalog();
        problem = diagnoseIconValue(effective, offered, stored);
    });

    it('should say the library is missing', () => {
        problem!.diagnostic!.kind.should.equal('missing-library');
    });

    it('should name the stored reference untouched', () => {
        problem!.reference.should.deep.equal({ library: 'Retired.Icons', key: 'home' });
    });
});
