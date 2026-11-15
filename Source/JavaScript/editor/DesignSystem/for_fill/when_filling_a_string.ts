// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fill } from '../fill';

describe('when filling a string', () => {
    it('should put each value where its name is', () => fill('{a} and {b}', { a: 'one', b: 'two' }).should.equal('one and two'));
    it('should put a value in as often as its name is there', () => fill('{a}{a}', { a: 'x' }).should.equal('xx'));
    it('should write a number', () => fill('v{version}', { version: 3 }).should.equal('v3'));
    it('should leave a name with no value as it is written', () => fill('{a} {b}', { a: 'one' }).should.equal('one {b}'));
    it('should ignore a value no name asks for', () => fill('{a}', { a: 'one', b: 'two' }).should.equal('one'));
    it('should write a value that looks like a pattern as it is', () => fill('{a}', { a: '$& {b}' }).should.equal('$& {b}'));
});
