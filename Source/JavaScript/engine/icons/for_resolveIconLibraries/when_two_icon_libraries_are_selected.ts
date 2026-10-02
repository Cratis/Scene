// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconLibraryResolution, resolveIconLibraries } from '../../index';
import { alphaName, betaName, catalog, componentsNeedingAlpha } from '../for_iconFixtures/iconFixtures';

describe('when two icon libraries are selected', () => {
    let result: IconLibraryResolution;

    beforeEach(() => {
        result = resolveIconLibraries([betaName, alphaName, componentsNeedingAlpha.name], catalog);
    });

    it('should activate both side by side', () => result.libraries.map((library) => library.library).should.have.members([alphaName, betaName]));
    it('should mark both as selected', () => result.libraries.every((library) => library.isSelected).should.be.true);
    it('should record a dependent only on the library it needs', () => {
        const alpha = result.libraries.find((library) => library.library === alphaName)!;
        const beta = result.libraries.find((library) => library.library === betaName)!;
        alpha.requiredBy.should.deep.equal([componentsNeedingAlpha.name]);
        beta.requiredBy.should.be.empty;
    });
});
