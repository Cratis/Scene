// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconLibraryResolution, resolveIconLibraries } from '../../index';
import { betaName, catalog, componentsNeedingNewerBeta } from '../for_iconFixtures/iconFixtures';

describe('when a dependent needs a version the library does not have', () => {
    let result: IconLibraryResolution;

    beforeEach(() => {
        result = resolveIconLibraries([componentsNeedingNewerBeta.name], catalog);
    });

    it('should still activate the library', () => result.libraries.map((library) => library.library).should.deep.equal([betaName]));
    it('should report an incompatible version for the library', () => {
        result.diagnostics.map((diagnostic) => [diagnostic.kind, diagnostic.library]).should.deep.equal([['incompatible-version', betaName]]);
    });
});
