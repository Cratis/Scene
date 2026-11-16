// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconValueProblem } from '../IconValueProblem';
import { diagnoseIconValue } from '../diagnoseIconValue';
import { aLoadedCatalog } from '../given/aLoadedCatalog';

describe('when the library dropped the icon', () => {
    let problem: IconValueProblem | undefined;

    beforeEach(async () => {
        const { effective, offered } = await aLoadedCatalog();
        problem = diagnoseIconValue(effective, offered, { library: 'Acme.Icons', key: 'gone' });
    });

    it('should say the icon is missing from a library that is present', () => {
        problem!.diagnostic!.kind.should.equal('missing-icon');
    });
});
