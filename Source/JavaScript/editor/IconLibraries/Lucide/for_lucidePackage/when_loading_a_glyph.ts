// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lucideAdapter } from '../lucideAdapter';
import { lucideLibraryName } from '../lucideManifest';

describe('when loading a Lucide glyph', () => {
    it('should load a component for a key the catalog lists', async () => {
        const glyph = await lucideAdapter.loadGlyph({ library: lucideLibraryName, key: 'house' });
        (glyph !== undefined).should.be.true;
    });

    it('should load nothing for a key the library does not have', async () => {
        (await lucideAdapter.loadGlyph({ library: lucideLibraryName, key: 'no-such-icon' }) === undefined).should.be.true;
    });
});
