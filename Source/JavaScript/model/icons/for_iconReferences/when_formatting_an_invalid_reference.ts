// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { formatIconReference } from '../iconReferences';

describe('when formatting an invalid reference', () => {
    it('should throw for a key containing the separator', () => {
        (() => formatIconReference({ library: 'acme', key: 'a#b' })).should.throw(/not a valid icon reference/);
    });

    it('should throw for an empty library', () => {
        (() => formatIconReference({ library: '', key: 'home' })).should.throw(/not a valid icon reference/);
    });
});
