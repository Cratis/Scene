// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { columnAt } from '../columnAt';

describe('when finding the column under a pointer', () => {
    const middles = [50, 150, 250];

    it('should be the first column left of the first header middle', () => columnAt(middles, 10)!.should.equal(0));
    it('should be the one between two header middles', () => columnAt(middles, 200)!.should.equal(2));
    it('should be after the last column right of every header middle', () => columnAt(middles, 400)!.should.equal(3));
    it('should be none when the table draws no headers', () => (columnAt([], 100) === undefined).should.be.true);
});
