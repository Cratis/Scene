// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createIconAdapterRegistry } from '../../index';

describe('when registering a second adapter for a library', () => {
    it('should refuse rather than silently replace the first', () => {
        const registry = createIconAdapterRegistry([{ library: 'alpha', loadGlyph: () => undefined }]);
        (() => registry.register({ library: 'alpha', loadGlyph: () => undefined })).should.throw(/already registered/);
    });

    it('should accept adapters for different libraries side by side', () => {
        createIconAdapterRegistry([
            { library: 'alpha', loadGlyph: () => undefined },
            { library: 'beta', loadGlyph: () => undefined },
        ]).libraries.should.deep.equal(['alpha', 'beta']);
    });
});
