// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { applyPlanSelection } from '../designModeSelection';

const recorder = () => {
    const calls: string[] = [];
    return { calls, target: {
        select: (id: string | undefined) => { calls.push(`select:${id}`); },
        selectItem: (component: string | undefined, item: string | undefined) => { calls.push(`item:${component}/${item}`); },
    } };
};

describe('when applying the selection of a plan', () => {
    it('should select nothing when the plan names nothing', () => {
        const { calls, target } = recorder();
        applyPlanSelection(target, undefined, 'c');
        calls.should.deep.equal([]);
    });
    it('should select the element the plan names', () => {
        const { calls, target } = recorder();
        applyPlanSelection(target, { elementId: 'e' }, 'c');
        calls.should.deep.equal(['select:e']);
    });
    it('should select the item within the component', () => {
        const { calls, target } = recorder();
        applyPlanSelection(target, { itemId: 'i' }, 'c');
        calls.should.deep.equal(['item:c/i']);
    });
    it('should clear the item when the plan names none', () => {
        const { calls, target } = recorder();
        applyPlanSelection(target, { itemId: null }, 'c');
        calls.should.deep.equal(['item:undefined/undefined']);
    });
    it('should select the element before the item', () => {
        const { calls, target } = recorder();
        applyPlanSelection(target, { elementId: 'e', itemId: 'i' }, 'c');
        calls.should.deep.equal(['select:e', 'item:c/i']);
    });
});
