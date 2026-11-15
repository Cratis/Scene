// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewCatalog } from '../blueprintPreviewCatalog';
import { initialPackageSelection } from '../initialPackageSelection';

describe('when starting from the catalog', () => {
    let selection: string[];

    beforeEach(() => {
        selection = initialPackageSelection(blueprintPreviewCatalog);
    });

    it('should pick the base component libraries, the styling packages and a blueprint', () => {
        selection.should.deep.equal(['core', 'PrimeReact', 'Tailwind', 'Cratis.Blueprint.Default']);
    });

    it('should leave the layered component library to dependency resolution', () => {
        selection.should.not.contain('Cratis.Components');
    });
});
