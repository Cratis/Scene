// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentsUiLibraryContract, validateComponentsUiLibraryMapping } from '../index';

const contract: ComponentsUiLibraryContract = {
    module: '@example/presentation', exportName: 'presentationLibrary', id: 'example', abi: 1,
    profile: 'presentation', requiredSlots: ['common.button'], requiredCapabilities: ['slot.render'],
};

describe('when the Components UI library mapping matches a structural renderer manifest', () => {
    let problems: string[];
    beforeEach(() => {
        problems = validateComponentsUiLibraryMapping(contract, {
            id: 'example', abi: 1, profile: 'presentation', capabilities: ['slot.render'],
            slots: { 'common.button': { render: () => undefined }, 'common.surface': { render: () => undefined } },
        });
    });
    it('should allow additional slots without deriving Scene components from them', () => problems.should.be.empty);
});
