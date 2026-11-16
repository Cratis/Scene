// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The words of the outlet design mode (StudioIssues#1330): what an outlet and its items say on the surface and in the inspector, whichever of the five
// kinds it is.
export interface OutletStrings {

    // The name of each kind, and of the item its "+" adds.
    kinds: Record<string, string>;
    newItem: Record<string, string>;

    // The frame on the surface: `outlet toolbar · actions`, and the tag that says where the items come from (6d).
    frameName: (name: string, kind: string) => string;
    tagLong: (name: string, summary: string) => string;

    // The Outlet section of the inspector: what it is, who declares it and the level being edited.
    title: (name: string, kind: string) => string;
    declaredBy: (owner: string) => string;
    editingAs: string;
    levels: Record<string, string>;
    levelName: (kind: string, name: string) => string;
    everyScreenBelow: (level: string) => string;

    // The Inherit / Extend / Override cards, and the question going to Override asks.
    modeTitle: string;
    modes: Record<'inherit' | 'extend' | 'override', { title: string; description: (owner: string) => string }>;
    copyPrompt: string;
    copyYes: string;
    copyNo: string;
    extendsNotice: string;

    // The item list: what an item is, where it comes from, and what can be done with one that is not here.
    items: string;
    add: (item: string) => string;
    own: string;
    fromLevel: (owner: string) => string;
    contributedBy: (owner: string) => string;
    hiddenHere: string;
    overriddenHere: string;
    hide: string;
    bringBack: string;
    contributionNote: string;
    nothingYet: string;

    // What an item binds to, by kind (6c), and what a chip says before it is bound.
    bindings: {
        title: string;
        sets: string;
        control: string;
        controls: Record<string, string>;
        shows: string;
        valueFrom: string;
        trend: string;
        target: string;
        slot: string;
        icon: string;
        opens: string;
        opensChoices: Record<string, string>;
        chooseParameter: string;
        chooseScreen: string;
        chooseField: string;
        automatic: string;
        noQuery: string;
    };

    // Lists the other outlets of the screen with each one's mode.
    otherOutlets: string;
    modeOf: Record<'inherit' | 'extend' | 'override' | 'declares', string>;
    added: (count: number) => string;

    // The Slots and Outlets of a template being authored (6b).
    template: {
        slots: string;
        outlets: string;
        name: string;
        kind: string;
        subject: string;
        subjects: Record<string, string>;
        slot: string;
        noSlot: string;
        defaults: string;
        defaultsCount: (count: number) => string;
        addOutlet: string;
        removeOutlet: string;
        removeDefault: string;
        newOutletName: string;
        routed: string;
        primary: string;
        optional: string;
    };
}

export const defaultOutletStrings: OutletStrings = {
    kinds: { actions: 'actions', filters: 'filters', tabs: 'tabs', stats: 'stats', navigation: 'navigation' },
    newItem: { button: 'New button', filter: 'New filter', tab: 'New tab', stat: 'New stat', navigation: 'New item', menuEntry: 'New entry', separator: 'Separator', group: 'New group' },
    frameName: (name, kind) => `outlet ${name} · ${kind}`,
    tagLong: (name, summary) => `${name} · ${summary}`,
    title: (name, kind) => `Outlet · ${name} ${kind}`,
    declaredBy: owner => `From ${owner}.`,
    editingAs: 'Editing as',
    levels: { module: 'module', feature: 'feature', slice: 'slice', screen: 'screen', template: 'template', layout: 'layout' },
    levelName: (kind, name) => `${kind} ${name}`,
    everyScreenBelow: level => `Every screen in ${level} gets this.`,
    modeTitle: 'How this level takes the outlet',
    modes: {
        inherit: { title: 'Inherit', description: owner => `${owner}'s items, unchanged.` },
        extend: { title: 'Extend', description: owner => `${owner}'s items, then yours. Hide the ones you don't want.` },
        override: { title: 'Override', description: owner => `Only your items. ${owner}'s stay listed, struck through, so you can bring one back.` },
    },
    copyPrompt: 'Copy the inherited items, so you start from them?',
    copyYes: 'Copy them',
    copyNo: 'Start empty',
    extendsNotice: 'This level now extends the inherited items',
    items: 'Items',
    add: item => `Add ${item}`,
    own: 'yours',
    fromLevel: owner => `from ${owner}`,
    contributedBy: owner => `contributed by ${owner}`,
    hiddenHere: 'hidden here',
    overriddenHere: 'overridden here',
    hide: 'Hide',
    bringBack: 'Bring back',
    contributionNote: 'Contributed items belong to the feature that adds them; they always come after the inherited items.',
    nothingYet: 'No items yet.',
    bindings: {
        title: 'Title',
        sets: 'Sets',
        control: 'Control',
        controls: { search: 'Search', choice: 'Choice chips', range: 'Range', date: 'Date' },
        shows: 'Shows',
        valueFrom: 'Value from',
        trend: 'Trend from',
        target: 'Navigate to',
        slot: 'Render into slot',
        icon: 'Icon',
        opens: 'Opens',
        opensChoices: { automatic: 'Automatic', none: 'Run directly', dialog: 'Dialog', drawer: 'Drawer', slot: 'In a slot' },
        chooseParameter: 'Choose parameter',
        chooseScreen: 'Choose screen',
        chooseField: 'Choose field',
        automatic: 'Automatic',
        noQuery: 'The screen shows no query yet, so there is nothing to bind to.',
    },
    otherOutlets: 'Other outlets on this screen',
    modeOf: { inherit: 'inherits', extend: 'extends', override: 'overrides', declares: 'declares' },
    added: count => `+${count}`,
    template: {
        slots: 'Slots',
        outlets: 'Outlets',
        name: 'Name',
        kind: 'Kind',
        subject: 'Acts on',
        subjects: { '': 'The screen', item: 'The selected item', screen: 'The screen' },
        slot: 'In slot',
        noSlot: 'No slot',
        defaults: 'Defaults',
        defaultsCount: count => count === 1 ? '1 default' : `${count} defaults`,
        addOutlet: 'Add outlet',
        removeOutlet: 'Remove outlet',
        removeDefault: 'Remove',
        newOutletName: 'outlet',
        routed: 'routed',
        primary: 'primary',
        optional: 'optional',
    },
};
