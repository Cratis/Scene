// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultOutletStrings, type OutletStrings } from './Outlets/OutletStrings';

// The words the design-mode chrome says: the floating toolbar of a selected item, the "+" that adds one, the chips, the popovers and the region
// tag. The titles of the actions themselves (Rename, Move earlier ...) are the component descriptor's; they are what the buttons are named by.
export interface DesignModeStrings {

    // The accessible name of the toolbar on a selected item, by what the item is.
    toolbarLabel: (itemLabel: string) => string;

    // The pill on the outline of the slot the screen fills: `slot: content`.
    slotName: (slot: string) => string;

    // The accessible name of an item as it is drawn on the surface, and of the field that renames it.
    titleField: string;

    // Shown on the link chip, and in the picker, when the item is linked to nothing.
    notLinked: string;

    // Shown on the slice chip of a button that invokes no slice yet.
    chooseSlice: string;

    // The slot an item renders into when it says none.
    mainArea: string;

    // The emphasis chip, by emphasis.
    emphasis: Record<string, string>;

    // The warning on a button with no slice (TB5).
    noSliceWarning: string;

    // The toolbar of an item that may not be changed here: why, and what can be done about it (DM6, NAV7).
    readOnlyReasons: Record<string, string>;
    inheritedFrom: (origin: string) => string;
    editAtOwner: string;

    // Names the popover that offers a choice, by the chip it came from.
    choiceLabel: (title: string) => string;
    close: string;

    // Toolbars (spec 6): what the Properties tab says about a button (p15-1).
    toolbar: {
        toolbarButton: string;
        opensAsDialog: string;
        dialogFromSlice: (template: string) => string;
        dialogDefault: (template: string) => string;
        sliceHelp: string;
        stateChangeHeading: string;
        notInvokableHeading: string;
        upgrade: string;
        upgradeNote: (slice: string) => string;

        // What a button shows (Scene 5.1's `display`): the field's name, the help under it and each choice by its value.
        shows: string;
        showsHelp: string;
        displays: Record<string, string>;
    };

    // Navigation (spec 5): what the regions, their items and the actions on inherited items say.
    navigation: {
        application: string;
        extendsNotice: string;
        overrideHere: string;
        editAtApplication: string;
        backToModule: (module: string) => string;

        // The long form of the tag on a region, for its tooltip (NAV13): `Topbar · extends application`.
        tagLong: (region: string, sources: string) => string;
        regionName: Record<string, string>;
        inheritedFromApplication: string;
        inheritedNote: (module: string) => string;
        definedIn: (scope: string) => string;
        inheritedReadOnly: string;
        navigationItem: string;
        hierarchy: string;
        label: string;
        navigateTo: string;
        renderIntoSlot: string;
        icon: string;
        notLinked: string;
        mainArea: string;
        sidePanel: string;
        modeTitle: (region: string, scope: string) => string;
        modeDescription: (region: string) => string;
        modes: Record<'inherit' | 'extend' | 'override', { title: string; description: string }>;
        copyPrompt: string;
        copyYes: string;
        copyNo: string;
        logo: string;
        logoTitle: string;
        logoImage: string;
        logoLocked: string;
        target: { heading: string; application: string; module: string; unresolved: (target: string) => string };
        problems: Record<string, string>;
    };

    // The outlet design mode - every kind of outlet, at every level (StudioIssues#1330).
    outlets: OutletStrings;

    // What is announced when an item is selected, added, moved, duplicated or removed.
    announce: {
        added: (label: string) => string;
        moved: (label: string, position: number, of: number) => string;
        duplicated: (label: string) => string;
        removed: (label: string) => string;
        refused: (reason: string) => string;
        nothingToAdd: string;
    };
}

export const defaultDesignModeStrings: DesignModeStrings = {
    toolbarLabel: itemLabel => `Actions for ${itemLabel}`,
    slotName: slot => `slot: ${slot}`,
    titleField: 'Title',
    notLinked: 'Not linked',
    chooseSlice: 'Choose slice',
    mainArea: 'Main area',
    emphasis: { primary: 'Primary', secondary: 'Secondary', quiet: 'Quiet' },
    noSliceWarning: 'No slice is linked to this button',
    readOnlyReasons: { 'item.inherited': 'Inherited from the template' },
    inheritedFrom: origin => `Inherited from ${origin}`,
    editAtOwner: 'Edit at application level',
    choiceLabel: title => title,
    toolbar: {
        toolbarButton: 'Button',
        opensAsDialog: 'opens as dialog',
        dialogFromSlice: template => `Opens the slice's own dialog template, ${template}.`,
        dialogDefault: template => `The slice names no dialog template, so it opens the default ${template}.`,
        sliceHelp: 'Only State Change slices can be picked. State Views and Automations never take user input, so they are listed as unavailable.',
        stateChangeHeading: 'State Change slices',
        notInvokableHeading: 'Not invokable from a button',
        upgrade: 'Upgrade to the slice',
        upgradeNote: slice => `This button names a command. The slice that accepts it is ${slice}, and that is what it runs. `,
        shows: 'Shows',
        showsHelp: 'An icon-only button keeps its title as its accessible name and tooltip.',
        displays: { iconAndTitle: 'Icon and title', icon: 'Icon only', title: 'Title only' },
    },
    navigation: {
        application: 'Application',
        extendsNotice: 'Region now extends the inherited items',
        overrideHere: 'Override here',
        editAtApplication: 'Edit at application level',
        backToModule: module => `Back to ${module}`,
        tagLong: (region, sources) => {
            const name = region === 'sidebar' ? 'Sidebar' : 'Topbar';
            const how = sources === 'defined here' ? 'defined here' : sources === 'inherited' ? 'inherits the application' : sources.endsWith(' only') ? 'overrides the application' : 'extends application';
            return `${name} · ${how}`;
        },
        regionName: { topbar: 'topbar', sidebar: 'sidebar' },
        inheritedFromApplication: 'Inherited from Application',
        inheritedNote: module => `This item comes from the Application. Override this region to edit a copy in ${module}.`,
        definedIn: scope => `defined in ${scope}`,
        inheritedReadOnly: 'inherited · read-only',
        navigationItem: 'Navigation item',
        hierarchy: 'Where it appears',
        label: 'Label',
        navigateTo: 'Navigate to',
        renderIntoSlot: 'Render into slot',
        icon: 'Icon',
        notLinked: 'Not linked',
        mainArea: 'Main area',
        sidePanel: 'Side panel',
        modeTitle: (region, scope) => `${region} · ${scope}`,
        modeDescription: region => `How this module relates to the application-level ${region} items.`,
        modes: {
            inherit: { title: 'Inherit', description: 'Use the application items as they are. Removes items added in this module.' },
            extend: { title: 'Extend', description: "Application items first, then this module's own items." },
            override: { title: 'Override', description: "Only this module's items. Switching copies the application items so you can edit them." },
        },
        copyPrompt: 'Copy the application items so you can edit them?',
        copyYes: 'Copy them',
        copyNo: 'Start empty',
        logo: 'Logo',
        logoTitle: 'Name',
        logoImage: 'Image',
        logoLocked: 'The logo is defined at the application level only.',
        target: { heading: 'Navigate to', application: 'Application', module: 'module', unresolved: target => `${target} no longer exists` },
        problems: {
            navTargetMissing: 'This item leads nowhere yet.',
            navTargetOutOfScope: 'A module can only link to itself.',
            navModuleWithoutFeatures: 'That module has no feature to open.',
            navSlotUnknown: 'The layout has no such slot.',
            navDuplicateId: 'Another item uses this identity.',
        },
    },
    close: 'Close',
    outlets: defaultOutletStrings,
    announce: {
        added: label => `Added ${label}`,
        moved: (label, position, of) => `Moved ${label} to position ${position} of ${of}`,
        duplicated: label => `Duplicated ${label}`,
        removed: label => `Removed ${label}`,
        refused: reason => `Not possible: ${reason}`,
        nothingToAdd: 'Not possible: there is nothing here to add to',
    },
};
