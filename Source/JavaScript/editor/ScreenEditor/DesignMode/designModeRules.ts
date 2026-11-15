// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignModeItemAction } from '@cratis/scene.model';
import { itemEditableRule, itemInheritedReason } from '@cratis/scene.react';
import { designModeActions, type DesignModeItem } from './designModeTypes';

// The rule a mutating action names in `availability`, as the editor interprets it. A descriptor carries rule names, not functions, so the
// same declaration means the same in every host (Scene#99). A rule this editor does not know is not guessed at: the action is withheld.
export function isAvailableOn(action: DesignModeItemAction, item: DesignModeItem): boolean {
    switch (action.availability) {
        case undefined: return true;
        case itemEditableRule: return !item.readOnly;
        default: return false;
    }
}

// Why an item may not be changed, as the rule names it: `item.inherited` for an item an owner above this scope defines.
export const inheritedReasonRule = itemInheritedReason;

// What one action does to the toolbar for one item: whether it is drawn at all, and whether it can be pressed now.
export interface ActionState {
    visible: boolean;
    enabled: boolean;
}

// Whether an action is drawn on the item's toolbar and whether it can be pressed. A read-only item hides every mutating action (DM6); moving
// earlier is not offered on the first item, nor moving later on the last; a sub-item cannot have sub-items of its own (NAV10).
export function actionStateOf(action: DesignModeItemAction, item: DesignModeItem): ActionState {
    if (!isAvailableOn(action, item)) return { visible: false, enabled: false };
    switch (action.id) {
        case designModeActions.moveEarlier: return { visible: true, enabled: item.index > 0 };
        case designModeActions.moveLater: return { visible: true, enabled: item.index < item.count - 1 };
        case designModeActions.addSubItem: return { visible: true, enabled: item.parentId === undefined };
        default: return { visible: true, enabled: true };
    }
}
