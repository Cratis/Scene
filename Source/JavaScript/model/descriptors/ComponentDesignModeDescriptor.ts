// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconReference } from '../icons';

/**
 * An affordance a designer shows on the design surface to add an item to a component (the "+ Add tab" button of a tab strip,
 * the "Add item" of a toolbar).
 */
export interface DesignModeAddAction {
    /** Stable identity, unique within the component. */
    id: string;

    /** The label the designer shows. */
    label: string;

    /** The icon the designer shows next to it. */
    icon?: IconReference;

    /**
     * The `Collection` property of the component the new item is added to - the add is the ordinary `AddCollectionItem` edit. Absent,
     * the item is added to the component's own items, which the host resolves (the navigation region of a topbar, the children of a
     * toolbar).
     */
    collectionPath?: string;
}

/**
 * One button of the toolbar a designer shows over a selected item of a component.
 *
 * `availability` and `readOnlyReason` are rule *names*, interpreted by the package's design-time bundle exactly like
 * {@link DesignTimeActionDescriptor.availability}. The model carries no functions.
 */
export interface DesignModeItemAction {
    /** Stable identity, unique within the component. */
    id: string;

    /** The icon of the button. */
    icon: IconReference;

    /** The tooltip and accessible name of the button. */
    title: string;

    /** The button is shown without its title, in a tight row. */
    compact?: boolean;

    /** Names the rule that decides whether the button is shown and enabled for an item. Absent means always. */
    availability?: string;

    /** Names the rule that says why a read-only (inherited) item hides or disables the button. */
    readOnlyReason?: string;
}

/**
 * How a component is edited directly on the design surface: where its items are and which affordances the designer offers for
 * them. Plain data - a Visual Studio-style designer reads it without loading the component. Every edit it causes is a normal model edit
 * (`AddCollectionItem`, `RemoveCollectionItem`, `ReorderCollectionItems`, `EditCollectionItem`), so undo, redo and the dirty state
 * need nothing of their own.
 */
export interface ComponentDesignModeDescriptor {
    /**
     * The `Collection` property whose rows are the component's items. Absent when the items are not a property of the
     * component but something the host resolves - the navigation items of a topbar, the children of a toolbar.
     */
    itemsPath?: string;

    /** The "add" affordances. */
    addActions: DesignModeAddAction[];

    /** The buttons over a selected item. */
    itemToolbar: DesignModeItemAction[];
}

export const DesignModeAddActionPropertyNames: (keyof DesignModeAddAction)[] = ['id', 'label', 'icon', 'collectionPath'];
export const DesignModeItemActionPropertyNames: (keyof DesignModeItemAction)[] = ['id', 'icon', 'title', 'compact', 'availability', 'readOnlyReason'];
export const ComponentDesignModeDescriptorPropertyNames: (keyof ComponentDesignModeDescriptor)[] = ['itemsPath', 'addActions', 'itemToolbar'];
