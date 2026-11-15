// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconValueProblem } from '../IconValueProblem';
import { diagnoseIconValue } from '../diagnoseIconValue';
import { aLoadedCatalog } from '../given/aLoadedCatalog';

describe('when the icon is outside what the field allows', () => {
    let problem: IconValueProblem | undefined;
    let allowedProblem: IconValueProblem | undefined;

    beforeEach(async () => {
        const { effective, offered } = await aLoadedCatalog();
        problem = diagnoseIconValue(effective, offered, { library: 'Acme.Icons', key: 'trash' }, [{ library: 'Acme.Icons', key: 'home' }]);
        allowedProblem = diagnoseIconValue(effective, offered, { library: 'Acme.Icons', key: 'home' }, [{ library: 'Acme.Icons', key: 'home' }]);
    });

    it('should report it as not allowed rather than missing', () => {
        problem!.isNotAllowed.should.be.true;
        (problem!.diagnostic === undefined).should.be.true;
    });

    it('should accept an icon the field allows', () => {
        (allowedProblem === undefined).should.be.true;
    });
});
