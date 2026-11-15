// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, OutletKind, componentIcon, type ComponentDesignModeDescriptor, type DesignModeItemAction } from '@cratis/scene.model';
import { itemEditableRule, itemInheritedReason, navigationDesignMode, toolbarDesignMode } from '@cratis/scene.react';
import { designModeActions } from '../designModeTypes';

const mutating = (id: string, icon: string, title: string): DesignModeItemAction => ({ id, icon: componentIcon(icon), title, availability: itemEditableRule, readOnlyReason: itemInheritedReason });

const listActions: readonly DesignModeItemAction[] = [
    mutating(designModeActions.moveEarlier, 'arrow-left', 'Move earlier'),
    mutating(designModeActions.moveLater, 'arrow-right', 'Move later'),
    mutating(designModeActions.duplicate, 'copy', 'Duplicate'),
    mutating(designModeActions.delete, 'trash', 'Delete'),
];

// The "+" each kind of outlet has, and the item it adds: a button, a filter, a tab, a stat or a navigation item (6b).
export const addActionOf: Record<OutletKind, { id: string; item: OutletItemKind }> = {
    [OutletKind.Actions]: { id: designModeActions.addButton, item: OutletItemKind.Button },
    [OutletKind.Filters]: { id: designModeActions.addFilter, item: OutletItemKind.Filter },
    [OutletKind.Tabs]: { id: designModeActions.addTab, item: OutletItemKind.Tab },
    [OutletKind.Stats]: { id: designModeActions.addStat, item: OutletItemKind.Stat },
    [OutletKind.Navigation]: { id: designModeActions.addItem, item: OutletItemKind.Navigation },
};

const itemsOfKind = (kind: OutletKind, label: string, chips: readonly DesignModeItemAction[]): ComponentDesignModeDescriptor => ({
    addActions: [{ id: addActionOf[kind].id, label, icon: componentIcon('plus') }],
    itemToolbar: [mutating(designModeActions.rename, 'pencil', 'Rename'), ...chips, ...listActions],
});

// The design mode of an outlet of each kind: one mechanism, the same floating item toolbar, only the chips change per kind (6c). An outlet of actions and of
// navigation take Scene's own design modes, with the chips Scene does not declare yet - where a button opens its slice - added; filters, tabs and stats get
// the chips for what their items bind to.
export function outletDesignModeOf(kind: OutletKind): ComponentDesignModeDescriptor {
    switch (kind) {
        case OutletKind.Actions: {
            const scene = toolbarDesignMode();
            const at = scene.itemToolbar.findIndex(action => action.id === designModeActions.emphasis);
            // Where a button opens its slice and when it is enabled (StudioIssues#1331) sit beside the slice, ahead of the emphasis.
            const hooks = [mutating(designModeActions.opens, 'panel-right-open', 'Opens'), mutating(designModeActions.enabled, 'toggle-right', 'Enabled')];
            const itemToolbar = at < 0 ? [...scene.itemToolbar, ...hooks] : [...scene.itemToolbar.slice(0, at), ...hooks, ...scene.itemToolbar.slice(at)];
            return { ...scene, itemToolbar };
        }
        case OutletKind.Navigation: return navigationDesignMode({ sidebar: true });
        case OutletKind.Filters: return itemsOfKind(kind, 'Add filter', [mutating(designModeActions.sets, 'filter', 'Sets'), mutating(designModeActions.control, 'sliders-horizontal', 'Control')]);
        case OutletKind.Tabs: return itemsOfKind(kind, 'Add tab', [mutating(designModeActions.shows, 'app-window', 'Shows')]);
        case OutletKind.Stats: return itemsOfKind(kind, 'Add stat', [mutating(designModeActions.valueFrom, 'hash', 'Value from')]);
    }
}
