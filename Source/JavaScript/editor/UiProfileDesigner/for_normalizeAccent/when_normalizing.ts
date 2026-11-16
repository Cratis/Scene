// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { normalizeAccent } from '../Properties/normalizeAccent';

describe('when normalizing an accent', () => {
    it('should keep a six digit colour in lower case', () => normalizeAccent('#4F46E5').should.equal('#4f46e5'));
    it('should widen a three digit colour', () => normalizeAccent('#abc').should.equal('#aabbcc'));
    it('should trim the text', () => normalizeAccent('  #112233 ').should.equal('#112233'));
    it('should clear what is not a colour', () => normalizeAccent('blue').should.equal(''));
    it('should clear a missing value', () => normalizeAccent(undefined).should.equal(''));
    it('should clear a value that is not text', () => normalizeAccent(42).should.equal(''));
});
