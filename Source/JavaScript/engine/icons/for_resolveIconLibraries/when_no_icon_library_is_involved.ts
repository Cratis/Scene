// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconLibraryResolution, resolveIconLibraries } from '../../index';
import { catalog } from '../for_iconFixtures/iconFixtures';

describe('when no icon library is involved', () => {
    let result: IconLibraryResolution;

    beforeEach(() => {
        result = resolveIconLibraries([], catalog);
    });

    it('should activate no libraries', () => result.libraries.should.be.empty);
});
