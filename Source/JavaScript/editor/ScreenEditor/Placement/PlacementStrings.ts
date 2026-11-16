// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The words of the Opens and Enabled choices of a hook (StudioIssues#1331). Where each is explained, the explanation is Scene's own; these are the labels around it.
export interface PlacementStrings {
    opens: string;
    enabled: string;

    // The ways a hook opens its slice, each with what it is for.
    choices: Record<'automatic' | 'none' | 'dialog' | 'drawer' | 'slot', { label: string; hint: string }>;

    // What a chip says: `Automatic · Drawer`, or that nothing fits.
    chipAutomatic: (resolved: string) => string;
    chipNothingFits: string;
    chipSlot: (slot: string) => string;
    chipNotSet: string;

    // A slice with no screen of its own.
    screenless: string;
    chooseSlice: string;

    // The slots a slice can be opened in.
    slotsHeading: string;
    noSlots: string;
    slotKind: (role: string, routed: boolean) => string;
    slotRoute: (url: string) => string;
    slotPlaceholder: string;

    // What Enabled is derived from (6h).
    derivedFrom: string;
    actsOn: string;
    actsOnChoices: Record<'' | 'item' | 'screen', string>;
    condition: string;
    conditionHint: string;
    conditionPlaceholder: string;
    conditionUnreadable: string;
    steps: Record<'subject' | 'authorization' | 'condition', string>;
    alwaysEnabled: string;
    chipForItem: string;
    chipForScreen: string;
    chipWhen: (condition: string) => string;
}

export const defaultPlacementStrings: PlacementStrings = {
    opens: 'Opens',
    enabled: 'Enabled',
    choices: {
        automatic: { label: 'Automatic', hint: "The slice's first fit that the page has free." },
        none: { label: 'Run directly', hint: 'Issues the command without asking.' },
        dialog: { label: 'Dialog', hint: 'Opens the slice’s screen over the page.' },
        drawer: { label: 'Drawer', hint: 'Opens the slice’s screen in a drawer beside the page.' },
        slot: { label: 'In a slot', hint: 'Opens the slice’s screen in a slot of the page.' },
    },
    chipAutomatic: resolved => `Automatic · ${resolved}`,
    chipNothingFits: 'Automatic · nothing fits',
    chipSlot: slot => `In ${slot}`,
    chipNotSet: 'Choose a slice',
    screenless: 'This slice has no screen, so it can only run directly.',
    chooseSlice: 'Choose a slice first: where it opens depends on what it fits and needs.',
    slotsHeading: 'Slots of this page',
    noSlots: 'The page has no slots a slice could be put in.',
    slotKind: (role, routed) => routed ? `${role}, routed` : role,
    slotRoute: url => `Opening here changes the URL to ${url}`,
    slotPlaceholder: 'Choose a slot',
    derivedFrom: 'Enabled, worked out from',
    actsOn: 'Acts on',
    actsOnChoices: { '': 'What the outlet says', item: 'A selected item', screen: 'The screen' },
    condition: 'Enabled when',
    conditionHint: 'Compare what the selected item has, such as item.status == "onSale"; join with and / or.',
    conditionPlaceholder: 'item.status == "onSale"',
    conditionUnreadable: 'Scene cannot read this condition, so it will not be saved.',
    steps: { subject: 'Subject', authorization: 'Authorization', condition: 'Condition' },
    alwaysEnabled: 'Always',
    chipForItem: 'For item',
    chipForScreen: 'For screen',
    chipWhen: condition => `when ${condition}`,
};
