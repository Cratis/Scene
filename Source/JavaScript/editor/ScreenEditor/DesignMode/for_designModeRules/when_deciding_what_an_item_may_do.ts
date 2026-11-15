// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { componentIcon, type DesignModeItemAction } from '@cratis/scene.model';
import { itemEditableRule, itemInheritedReason } from '@cratis/scene.react';
import { actionStateOf, isAvailableOn } from '../designModeRules';
import type { DesignModeItem } from '../designModeTypes';

const action = (id: string, availability: string | null = itemEditableRule): DesignModeItemAction => ({ id, icon: componentIcon('x'), title: id, ...(availability ? { availability } : {}), readOnlyReason: itemInheritedReason });
const item = (rest: Partial<DesignModeItem> = {}): DesignModeItem => ({ id: 'i', label: 'Item', index: 1, count: 3, readOnly: false, values: {}, unlinked: false, ...rest });

describe('when an action is available while the item is editable', () => {
    it('should be available on an editable item', () => isAvailableOn(action('rename'), item()).should.be.true);
    it('should be withheld from a read-only item (DM6)', () => isAvailableOn(action('rename'), item({ readOnly: true, readOnlyReason: itemInheritedReason })).should.be.false);
});

describe('when an action names no rule', () => {
    it('should be available even on a read-only item', () => isAvailableOn(action('inspect', null), item({ readOnly: true })).should.be.true);
});

describe('when an action names a rule this editor does not know', () => {
    it('should be withheld rather than guessed at', () => isAvailableOn(action('rename', 'item.somethingElse'), item()).should.be.false);
});

describe('when asking how an action looks on an item', () => {
    it('should hide every mutating action on a read-only item', () => actionStateOf(action('delete'), item({ readOnly: true })).visible.should.be.false);
    it('should not offer moving earlier on the first item', () => { const state = actionStateOf(action('moveEarlier'), item({ index: 0 })); state.visible.should.be.true; state.enabled.should.be.false; });
    it('should offer moving earlier elsewhere', () => actionStateOf(action('moveEarlier'), item({ index: 1 })).enabled.should.be.true);
    it('should not offer moving later on the last item', () => actionStateOf(action('moveLater'), item({ index: 2 })).enabled.should.be.false);
    it('should not offer a sub-item on a sub-item (NAV10)', () => actionStateOf(action('addSubItem'), item({ parentId: 'p' })).enabled.should.be.false);
    it('should offer a sub-item on a top-level item', () => actionStateOf(action('addSubItem'), item()).enabled.should.be.true);
});
