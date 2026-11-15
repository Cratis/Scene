// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { areDesignedProfilesEqual, designedProfileOf } from '../Session/DesignedProfile';
import { defaults } from '../given/a_resolved_profile';

describe('when comparing designed profiles', () => {
    const original = designedProfileOf(defaults(), 'Acme');

    it('should find the same name and settings equal', () => areDesignedProfilesEqual(original, designedProfileOf(defaults(), 'Acme')).should.be.true);
    it('should find a renamed application different', () => areDesignedProfilesEqual(original, designedProfileOf(defaults(), 'Other')).should.be.false);
    it('should find changed settings different', () => areDesignedProfilesEqual(original, { ...original, accent: '#112233' }).should.be.false);
});
