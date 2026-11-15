// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { allowedIconChoices } from '../allowedIconChoices';

describe('when a descriptor supplies icon choices', () => {
    it('should pass their qualified identities to the picker', () =>
        allowedIconChoices([{ value: 'Acme.Icons#home', label: 'Home' }, { value: 'Other.Icons#home#solid', label: 'Solid home' }])!
            .should.deep.equal([{ library: 'Acme.Icons', key: 'home' }, { library: 'Other.Icons', key: 'home', variant: 'solid' }]));

    it('should ignore a malformed choice rather than guessing an identity', () =>
        allowedIconChoices([{ value: 'home', label: 'Home' }])!.should.be.empty);

    it('should leave a descriptor with no choices unrestricted', () =>
        (allowedIconChoices(undefined) === undefined).should.be.true);
});
