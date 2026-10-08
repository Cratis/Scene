// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { validateComponentsUiLibraryContract } from '../index';

describe('when a Components UI library contract has invalid declarations', () => {
    let problems: string[];
    beforeEach(() => {
        problems = validateComponentsUiLibraryContract({
            module: ' ', exportName: '', id: '', abi: 0.5, profile: '',
            requiredSlots: ['', 'common.button', 'common.button'], requiredCapabilities: ['slot.render', 'slot.render'],
        });
    });
    it('should diagnose every empty identity field', () => problems.filter(problem => problem.includes('has an empty') && !problem.includes('entry')).should.have.lengthOf(4));
    it('should reject a nonintegral ABI', () => problems.should.include('Components UI library mapping requires a positive integer ABI major'));
    it('should reject empty slot identities', () => problems.should.include("Components UI library mapping has an empty 'requiredSlots' entry"));
    it('should reject repeated slot identities', () => problems.should.include("Components UI library mapping repeats 'common.button' in 'requiredSlots'"));
    it('should reject repeated capability identities', () => problems.should.include("Components UI library mapping repeats 'slot.render' in 'requiredCapabilities'"));
});
