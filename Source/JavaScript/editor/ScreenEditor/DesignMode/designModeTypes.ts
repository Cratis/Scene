// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentDesignModeDescriptor, InspectedProperty, SceneDocument, SceneEdit } from '@cratis/scene.model';
import type { NavigationEdit } from '@cratis/scene.engine';

// The action ids a component's design mode declares (Scene's `navigationDesignMode` / `toolbarDesignMode`). The vocabulary is Scene's; the
// editor maps each one to the edit that carries it out.
export const designModeActions = {
    addItem: 'addItem',
    addButton: 'addButton',
    rename: 'rename',
    target: 'target',
    slot: 'slot',
    slice: 'slice',
    emphasis: 'emphasis',

    // What an outlet button shows - icon and title, icon only or title only (Scene 5.1). Edited in the Properties tab; Scene's floating toolbar has no chip for it.
    display: 'display',

    // The "+" of an outlet of filters, tabs and stats, and what their items bind to (StudioIssues#1330): a filter sets a parameter of the screen's query with a
    // control, a tab shows a screen, a stat takes its value from a field of a single-result query. An action opens its slice somewhere (Opens).
    addFilter: 'addFilter',
    addTab: 'addTab',
    addStat: 'addStat',
    sets: 'sets',
    control: 'control',
    shows: 'shows',
    valueFrom: 'valueFrom',
    opens: 'opens',

    // When an action is enabled (StudioIssues#1331): what it acts on, and the condition it adds to what its subject and its command's authorization already say.
    enabled: 'enabled',
    moveEarlier: 'moveEarlier',
    moveLater: 'moveLater',
    duplicate: 'duplicate',
    delete: 'delete',
    addSubItem: 'addSubItem',
} as const;

// Where the items of a design-mode component live in the document - which decides which edits change them (DM8: always ordinary Scene edits).
export enum DesignModeItemSourceKind {

    // The items are elements in one slot of the component (a toolbar's buttons).
    Elements = 'elements',

    // The items are the rows of a `Collection` property of the component (a navigation bar's items).
    Collection = 'collection',

    // The items are the items of a navigation region, held by the navigation model of the document (a topbar's or a sidebar's items).
    Region = 'region',

    // The items of an outlet as Scene resolves it through the template and the levels below it, held by the level being edited (StudioIssues#1330).
    Outlet = 'outlet',
}

// One item of a design-mode component, as the chrome shows and acts on it.
export interface DesignModeItem {
    id: string;
    label: string;

    // The position among the items next to it, and how many there are - what decides whether it can move earlier or later.
    index: number;
    count: number;

    // The item this one sits under, for a sub-item; nothing for a top-level item.
    parentId?: string;

    // Whether it may not be changed here (an inherited item), and the rule-named reason why.
    readOnly: boolean;
    readOnlyReason?: string;

    // Who owns it, when it is not this scope - the template or the application it comes from - for "Inherited from ...".
    origin?: string;

    // What the item holds, by the name of the field - the target, the slot, the slice, the emphasis - for the chips on the toolbar.
    values: Readonly<Record<string, unknown>>;

    // What a chip says when the source knows better than the raw value - the name of the target an item leads to, by the action that opens its choice.
    chips?: Readonly<Record<string, string>>;

    // What is wrong with it, as the engine reports it (`navTargetMissing`, `navSlotUnknown`, `navDuplicateId`): shown beside the item, never decided here.
    problems?: readonly { code: string; message: string }[];

    // Whether the author has not linked it to anything yet (a button without a slice, an item without a target): it is flagged (TB5).
    unlinked: boolean;

    // Where an outlet's item comes from, as Scene's provenance says: the level that owns it, and whether it is a default, the level's own or a contribution.
    provenance?: { owner: string; level: string; source: string };

    // An inherited or contributed item the level being edited hides, or one its override leaves out: still listed, struck through, with Bring back.
    removal?: 'hidden' | 'overridden';
}

// What the editor asks of a source before it offers a choice: the property the choice is made on, drawn by the registry editor, and what it
// becomes as a Scene edit when the author makes it.
export interface DesignModeChoice {
    property: InspectedProperty;
    plan: (value: unknown) => DesignModePlan | DesignModeRejection;
}

// What an action comes to: the edits that make it one undo step, and where the selection goes afterwards.
export interface DesignModePlan {
    label: string;
    edits: SceneEdit[];

    // What is selected after the edit is applied: an item (and the component it belongs to), or - for an item that was removed - what is next.
    select?: { elementId?: string; itemId?: string | null };

    // A new item opens with its title in the toolbar's input, selected, ready to type over (spec p13-3).
    renameNext?: boolean;

    // The edits of the navigation model of the document (Scene's `NavigationEdit`): they are applied all-or-nothing, in the same one undo step.
    navigationEdits?: NavigationEdit[];

    // A change of the document that no Scene edit carries - a level's refinement of an outlet, a template's outlets - applied in the same one undo step.
    documentChange?: (document: SceneDocument) => SceneDocument;

    // Said to the author when the action did more than was asked - "+" on an inheriting region switched it to extend (p13-3).
    notice?: string;

    // Moves the editor to the application level, where what a module inherits is defined (NAV7: Edit at application level).
    editAtApplication?: boolean;
}

export interface DesignModeRejection {
    rejected: string;
}

export const isRejection = (outcome: DesignModePlan | DesignModeRejection): outcome is DesignModeRejection => 'rejected' in outcome;

// An action offered on the item that is read-only: it is not an edit of the item, and the source says what it does.
export interface DesignModeReadOnlyAction {
    id: string;
    label: string;
    plan: () => DesignModePlan | DesignModeRejection;
}

// What a design-mode component can do with its items. A source is made for one component and one document state; it never holds state of
// its own, so the same document always draws the same chrome.
export interface DesignModeItemSource {
    kind: DesignModeItemSourceKind;
    items: readonly DesignModeItem[];

    // The "+" actions: which exist is the descriptor's; what each does is the source's.
    add: (actionId: string) => DesignModePlan | DesignModeRejection;

    // An action on an item. A choice action (target, slot, slice, emphasis) is `choice`, which gives the property to draw in a popover.
    act: (actionId: string, item: DesignModeItem) => DesignModePlan | DesignModeRejection;
    rename: (item: DesignModeItem, label: string) => DesignModePlan | DesignModeRejection;
    choice: (actionId: string, item: DesignModeItem) => DesignModeChoice | undefined;

    // What the source offers on a read-only item instead (Override here, Edit at application level).
    readOnlyActions: (item: DesignModeItem) => readonly DesignModeReadOnlyAction[];

    // Where the region tag is drawn and what it says, for a source that is a region (NAV13).
    regionTag?: { text: string; long: string; kind: string };

    // The mode of a module's region, and the module and region it is for - what the region panel offers (NAV2-NAV5); absent for a source that is no region.
    region?: { region: 'topbar' | 'sidebar'; module?: string; mode?: 'inherit' | 'extend' | 'override' };
}

// The component, its design mode and its items, with the item that is selected.
export interface DesignModeSubject {
    componentId: string;
    componentName: string;
    mode: ComponentDesignModeDescriptor;
    source: DesignModeItemSource;
    selected?: DesignModeItem;
}
