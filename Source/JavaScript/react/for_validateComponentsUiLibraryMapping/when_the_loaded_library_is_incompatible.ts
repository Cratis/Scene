// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { validateComponentsUiLibraryMapping } from '../index';

describe('when the loaded Components UI library is incompatible with its Scene mapping', () => {
    let problems: string[];
    beforeEach(() => {
        problems = validateComponentsUiLibraryMapping({
            module: '@example/presentation', exportName: 'presentationLibrary', id: 'expected', abi: 1,
            profile: 'presentation', requiredSlots: ['common.button', 'common.textInput'],
            requiredCapabilities: ['slot.render'],
        }, {
            id: 'other', abi: 2, profile: 'other-profile', capabilities: [],
            slots: { 'common.button': undefined },
        });
    });
    it('should diagnose the library identity', () => problems.some(problem => problem.includes("requires id 'expected'")).should.be.true);
    it('should diagnose the ABI major', () => problems.some(problem => problem.includes("requires abi '1'")).should.be.true);
    it('should diagnose the promised profile', () => problems.some(problem => problem.includes("requires profile 'presentation'")).should.be.true);
    it('should diagnose an unimplemented slot', () => problems.some(problem => problem.includes("required slot 'common.button'")).should.be.true);
    it('should diagnose a missing slot', () => problems.some(problem => problem.includes("required slot 'common.textInput'")).should.be.true);
    it('should diagnose a missing capability', () => problems.some(problem => problem.includes("required capability 'slot.render'")).should.be.true);
});
