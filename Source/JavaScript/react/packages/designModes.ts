// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDesignModeDescriptor, DesignModeItemAction, componentIcon } from '@cratis/scene.model';

/** The rule that says an item may be changed (not inherited), interpreted by the package's design-time bundle. */
export const itemEditableRule = 'item.editable';

/** The rule that says why an inherited item may not be changed. */
export const itemInheritedReason = 'item.inherited';

const mutating = (action: Omit<DesignModeItemAction, 'icon'> & { icon: string }, compact?: boolean): DesignModeItemAction => ({
    id: action.id,
    icon: componentIcon(action.icon),
    title: action.title,
    ...(compact === true ? { compact: true } : {}),
    availability: action.availability ?? itemEditableRule,
    readOnlyReason: itemInheritedReason,
});

export interface NavigationDesignModeOptions {
    /** The `Collection` property that holds the items; absent when the host resolves them (a topbar's or sidebar's navigation region). */
    itemsPath?: string;

    /** A sidebar's items nest, and its toolbar sits below the item in a compact two-row form (spec DM3, DM4). */
    sidebar?: boolean;
}

/**
 * The design mode of a component made of navigation items (a topbar, a sidebar, a navigation bar): add an item, and on a selected
 * item rename it, choose its target and rendering slot, move it earlier or later, duplicate it, delete it, and - in a sidebar - add a
 * sub-item (spec DM3). Pass the `itemsPath` of a component whose items are a `Collection` property; the target and slot buttons are
 * left out of such a component unless `itemsPath` is absent, because only the navigation region's items have them.
 */
export function navigationDesignMode(options: NavigationDesignModeOptions = {}): ComponentDesignModeDescriptor {
    const { itemsPath, sidebar = false } = options;
    const regionItems = itemsPath === undefined;

    return {
        ...(itemsPath === undefined ? {} : { itemsPath }),
        addActions: [{ id: 'addItem', label: 'Add item', icon: componentIcon('plus'), ...(itemsPath === undefined ? {} : { collectionPath: itemsPath }) }],
        itemToolbar: [
            mutating({ id: 'rename', icon: 'pencil', title: 'Rename' }, sidebar),
            ...(regionItems ? [
                mutating({ id: 'target', icon: 'link', title: 'Link target' }, sidebar),
                mutating({ id: 'slot', icon: 'layout-panel-left', title: 'Rendering slot' }, sidebar),
            ] : []),
            mutating({ id: 'moveEarlier', icon: sidebar ? 'arrow-up' : 'arrow-left', title: 'Move earlier' }, sidebar),
            mutating({ id: 'moveLater', icon: sidebar ? 'arrow-down' : 'arrow-right', title: 'Move later' }, sidebar),
            mutating({ id: 'duplicate', icon: 'copy', title: 'Duplicate' }, sidebar),
            mutating({ id: 'delete', icon: 'trash', title: 'Delete' }, sidebar),
            ...(sidebar ? [mutating({ id: 'addSubItem', icon: 'corner-down-right', title: 'Add sub-item' }, true)] : []),
        ],
    };
}

/**
 * The design mode of a toolbar: add a button, and on a selected button rename it, choose the slice it starts, set its emphasis,
 * move it earlier or later, duplicate it, delete it (spec DM3). The buttons are the toolbar's own items, which the host resolves.
 */
export function toolbarDesignMode(): ComponentDesignModeDescriptor {
    return {
        addActions: [{ id: 'addButton', label: 'Add button', icon: componentIcon('plus') }],
        itemToolbar: [
            mutating({ id: 'rename', icon: 'pencil', title: 'Rename' }),
            mutating({ id: 'slice', icon: 'git-branch', title: 'Choose slice' }),
            mutating({ id: 'emphasis', icon: 'contrast', title: 'Emphasis' }),
            mutating({ id: 'moveEarlier', icon: 'arrow-left', title: 'Move earlier' }),
            mutating({ id: 'moveLater', icon: 'arrow-right', title: 'Move later' }),
            mutating({ id: 'duplicate', icon: 'copy', title: 'Duplicate' }),
            mutating({ id: 'delete', icon: 'trash', title: 'Delete' }),
        ],
    };
}
