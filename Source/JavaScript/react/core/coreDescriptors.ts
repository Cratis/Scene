// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, Opens, OutletButtonDisplay, OutletKind, OutletSubject, PropertyEditorKind, PropertyValueType, ToolbarEmphasis } from '@cratis/scene.model';
import { componentRegistryKey, describeComponents } from '../packages';
import { coreComponentMetadata } from './coreComponentMetadata';

const key = (name: string) => componentRegistryKey('core', name);

/**
 * Where an action's slice opens, its subject and when it is enabled: the one model the `action` component shares with the
 * buttons and menu entries of an outlet of actions (`OutletAction`).
 */
const actionPlacementProperties: ComponentDescriptor['properties'] = [
    {
        path: 'opens', label: 'Opens', group: 'Behavior', valueType: PropertyValueType.Enum, default: Opens.Automatic,
        editorKind: PropertyEditorKind.Enum,
        choices: [
            { value: Opens.Automatic, label: 'Automatic' },
            { value: Opens.None, label: 'Run directly' },
            { value: Opens.Dialog, label: 'Ask in a dialog' },
            { value: Opens.Drawer, label: 'Ask in a drawer' },
            { value: Opens.Slot, label: 'In a slot' },
        ],
        description: 'Where the slice\'s screen opens. Automatic takes the first place the slice fits that the page has free; run directly needs a source for every input.',
    },
    {
        path: 'opensIn', label: 'Slot', group: 'Behavior', valueType: PropertyValueType.String,
        description: 'The slot of the page the screen opens in, when it opens in a slot.',
    },
    {
        path: 'subject', label: 'Acts on', group: 'Behavior', valueType: PropertyValueType.Enum,
        editorKind: PropertyEditorKind.Enum,
        choices: [
            { value: OutletSubject.Item, label: 'The selected item' },
            { value: OutletSubject.Screen, label: 'The screen' },
        ],
        description: 'An action for an item waits for one to be selected.',
    },
    {
        path: 'enabledWhen', label: 'Enabled when', group: 'Behavior', valueType: PropertyValueType.String,
        description: 'A condition, in guarded-action condition grammar, under which the action is enabled, such as item.status == "onSale".',
    },
];

/**
 * What can be edited on the `core` package's components.
 *
 * Only the components an author configures by hand are described: a button's label, an action's command and its
 * argument mapping, a column's heading, and the navigation bar. The Screenplay structural components - `data`,
 * `section`, `summary` - have nothing to edit that is not already a node in the tree.
 */
const describedCore: ComponentDescriptor[] = [
    {
        component: key('button'),
        displayName: 'Button',
        properties: [
            { path: 'label', label: 'Label', group: 'Content', valueType: PropertyValueType.String, default: '' },
        ],
    },
    {
        component: key('action'),
        displayName: 'Command action',
        description: 'Invokes a modeled command. The command and its argument mapping are stored on the element; the host that handles the command event reads them.',
        properties: [
            { path: 'label', label: 'Label', group: 'Content', valueType: PropertyValueType.String },
            {
                path: 'command', label: 'Command', group: 'Behavior', valueType: PropertyValueType.String,
                editorKind: 'stateChangeReference', constraints: { required: true },
                description: 'The state change this action submits.',
            },
            {
                path: 'arguments', label: 'Argument mapping', group: 'Behavior', valueType: PropertyValueType.Collection,
                description: 'Where each command argument comes from.',
                item: {
                    label: 'Argument',
                    properties: [
                        { path: 'name', label: 'Argument', group: 'Behavior', valueType: PropertyValueType.String, constraints: { required: true } },
                        { path: 'source', label: 'Source', group: 'Behavior', valueType: PropertyValueType.String, editorKind: 'bindingPath', constraints: { required: true } },
                    ],
                },
            },
            ...actionPlacementProperties,
        ],
    },
    {
        component: key('guarded-action'),
        displayName: 'Guarded command action',
        description: 'Runs the first matching command for the selected item. Hidden unless a branch or executable fallback is selected; unsupported guards are refused.',
        properties: [
            { path: 'label', label: 'Label', group: 'Content', valueType: PropertyValueType.String },
            { path: 'item', label: 'Selected item', group: 'Data', valueType: PropertyValueType.Object, open: true },
            { path: 'alternatives', label: 'Alternatives', group: 'Behavior', valueType: PropertyValueType.Collection,
                item: { label: 'Alternative', positional: true, properties: [
                    { path: 'command', label: 'Command', group: 'Behavior', valueType: PropertyValueType.String },
                    { path: 'condition', label: 'Condition', group: 'Behavior', valueType: PropertyValueType.Object, open: true },
                    { path: 'arguments', label: 'Arguments', group: 'Behavior', valueType: PropertyValueType.Object, open: true },
                ] } },
            { path: 'otherwise', label: 'Fallback', group: 'Behavior', valueType: PropertyValueType.Object, open: true },
            { path: 'navigateToScreen', label: 'Success screen', group: 'Navigation', valueType: PropertyValueType.String },
            { path: 'navigateByParameter', label: 'Navigation parameter', group: 'Navigation', valueType: PropertyValueType.String },
        ],
    },
    {
        component: key('outletItems'),
        displayName: 'Outlet',
        description: 'Draws the items of an outlet where the template or screen places it: actions as a toolbar, filters, tabs, stats or navigation. Inside a page that declares the outlet it draws what the page resolves; on its own it draws the items it carries.',
        properties: [
            { path: 'name', label: 'Outlet', group: 'Content', valueType: PropertyValueType.String, constraints: { required: true }, description: 'The name of the outlet, such as toolbar or filters.' },
            {
                path: 'kind', label: 'Kind', group: 'Content', valueType: PropertyValueType.Enum, default: OutletKind.Actions,
                editorKind: PropertyEditorKind.Enum,
                choices: [
                    { value: OutletKind.Actions, label: 'Actions' },
                    { value: OutletKind.Filters, label: 'Filters' },
                    { value: OutletKind.Tabs, label: 'Tabs' },
                    { value: OutletKind.Stats, label: 'Stats' },
                    { value: OutletKind.Navigation, label: 'Navigation' },
                ],
                description: 'What the outlet lists; the kind decides which items it takes.',
            },
            {
                path: 'subject', label: 'Acts on', group: 'Behavior', valueType: PropertyValueType.Enum,
                editorKind: PropertyEditorKind.Enum,
                choices: [
                    { value: OutletSubject.Item, label: 'The selected item' },
                    { value: OutletSubject.Screen, label: 'The screen' },
                ],
                description: 'Only for actions: actions for an item wait for one to be selected.',
            },
            { path: 'slot', label: 'Slot', group: 'Behavior', valueType: PropertyValueType.String, description: 'Only for tabs: the slot the tabs own and show the chosen screen in.' },
            { path: 'item', label: 'Selected item', group: 'Data', valueType: PropertyValueType.Object, open: true, description: 'What actions for an item act on, usually a table\'s selected row.' },
            {
                path: 'items', label: 'Items', group: 'Content', valueType: PropertyValueType.Collection,
                description: 'The items the outlet shows when no page around it declares the outlet.',
                item: {
                    label: 'Item',
                    properties: [
                        { path: 'id', label: 'Id', group: 'Content', valueType: PropertyValueType.String, constraints: { required: true } },
                        { path: 'title', label: 'Title', group: 'Content', valueType: PropertyValueType.String },
                        {
                            path: 'slice', label: 'Slice to invoke', group: 'Behavior', valueType: PropertyValueType.String,
                            editorKind: PropertyEditorKind.Slice, editorOptions: { kinds: ['StateChange'] },
                            description: 'Only State Change slices can be picked.',
                        },
                        {
                            path: 'emphasis', label: 'Emphasis', group: 'Appearance', valueType: PropertyValueType.Enum, default: ToolbarEmphasis.Secondary,
                            editorKind: PropertyEditorKind.Enum,
                            choices: [
                                { value: ToolbarEmphasis.Primary, label: 'Primary' },
                                { value: ToolbarEmphasis.Secondary, label: 'Secondary' },
                                { value: ToolbarEmphasis.Quiet, label: 'Quiet' },
                            ],
                        },
                        { path: 'icon', label: 'Icon', group: 'Appearance', valueType: PropertyValueType.Icon, editorKind: 'iconPicker' },
                        {
                            path: 'display', label: 'Shows', group: 'Appearance', valueType: PropertyValueType.Enum, default: OutletButtonDisplay.IconAndTitle,
                            editorKind: PropertyEditorKind.Enum,
                            choices: [
                                { value: OutletButtonDisplay.IconAndTitle, label: 'Icon and title' },
                                { value: OutletButtonDisplay.Icon, label: 'Icon only' },
                                { value: OutletButtonDisplay.Title, label: 'Title only' },
                            ],
                            description: 'Only for buttons: what the button shows. An icon-only button keeps its title as its accessible name and tooltip.',
                        },
                        {
                            path: 'confirm', label: 'Confirmation', group: 'Behavior', valueType: PropertyValueType.String,
                            description: 'Optional question the user answers before the action runs.',
                        },
                        ...actionPlacementProperties,
                    ],
                },
            },
        ],
    },
    {
        component: key('sliceDialog'),
        displayName: 'Slice dialog',
        description: 'The task dialog of a state change slice: the form of its command with Cancel and a submit button. Opened from a toolbar button it takes the slice, command and title from the button; set them to fix the dialog to one slice.',
        properties: [
            {
                path: 'slice', label: 'Slice', group: 'Behavior', valueType: PropertyValueType.String,
                editorKind: PropertyEditorKind.Slice, editorOptions: { kinds: ['StateChange'] },
                description: 'The State Change slice the dialog submits; empty to take it from the toolbar button that opens the dialog.',
            },
            { path: 'title', label: 'Title', group: 'Content', valueType: PropertyValueType.String, description: 'The dialog title and submit label; empty to take the toolbar button title.' },
        ],
    },
    {
        component: key('column'),
        displayName: 'Table column',
        properties: [
            { path: 'property', label: 'Result field', group: 'Data', valueType: PropertyValueType.String, editorKind: 'resultField', constraints: { required: true } },
            { path: 'label', label: 'Heading', group: 'Content', valueType: PropertyValueType.String },
        ],
    },
    {
        component: key('slot'),
        displayName: 'Slot',
        description: 'A named region another screen opens into. Placing a screen here keeps this screen on the page, and the placed screen may declare slots of its own.',
        properties: [{ path: 'name', label: 'Name', group: 'Navigation', valueType: PropertyValueType.String, constraints: { required: true } }],
    },
    {
        component: key('navigationBar'),
        displayName: 'Navigation bar',
        description: 'A list of navigation items. A template author fixes the first item (Home) and can expose the list so that screens add their own.',
        properties: [
            { path: 'title', label: 'Title', group: 'Content', valueType: PropertyValueType.String, default: 'Navigation' },
            {
                path: 'items', label: 'Items', group: 'Content', valueType: PropertyValueType.Collection, default: [],
                item: {
                    label: 'Navigation item',
                    properties: [
                        { path: 'label', label: 'Label', group: 'Content', valueType: PropertyValueType.String, constraints: { required: true, minimumLength: 1 } },
                        { path: 'icon', label: 'Icon', group: 'Content', valueType: PropertyValueType.Icon, editorKind: 'iconPicker' },
                        { path: 'destination', label: 'Destination', group: 'Content', valueType: PropertyValueType.Destination, editorKind: 'screenPicker', constraints: { required: true } },
                    ],
                },
            },
        ],
    },
];

/** The `core` package's descriptors: the hand-written ones above with every component's category, icon, keywords and design mode (CMP1). */
export const coreDescriptors: ComponentDescriptor[] = describeComponents('core', describedCore, coreComponentMetadata);