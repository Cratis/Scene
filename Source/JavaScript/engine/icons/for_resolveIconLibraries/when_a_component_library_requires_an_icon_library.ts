// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconLibraryResolution, resolveIconLibraries } from '../../index';
import { alphaName, catalog, componentsNeedingAlpha } from '../for_iconFixtures/iconFixtures';

describe('when a component library requires an icon library', () => {
    let result: IconLibraryResolution;

    beforeEach(() => {
        result = resolveIconLibraries([componentsNeedingAlpha.name], catalog);
    });

    it('should activate the required icon library', () => result.libraries.map((library) => library.library).should.deep.equal([alphaName]));
    it('should say the library was not selected itself', () => result.libraries[0].isSelected.should.be.false);
    it('should record what requires it', () => result.libraries[0].requiredBy.should.deep.equal([componentsNeedingAlpha.name]));
    it('should report no problems', () => result.diagnostics.should.be.empty);
});
