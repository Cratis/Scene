// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, PropertyEditorKind, PropertyValueType, ToolbarEmphasis } from '@cratis/scene.model';
import { componentRegistryKey, describeComponents } from '../packages';
import { coreComponentMetadata } from './coreComponentMetadata';

const key = (name: string) => componentRegistryKey('core', name);

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
        component: key('toolbarItem'),
        displayName: 'Toolbar button',
        description: 'One toolbar button. An Action button invokes a state change slice and opens it as a task dialog over the page; a button with no slice is allowed while designing and is flagged.',
        properties: [
            { path: 'label', label: 'Title', group: 'Content', valueType: PropertyValueType.String, default: 'Button' },
            {
                path: 'slice', label: 'Slice to invoke', group: 'Behavior', valueType: PropertyValueType.String,
                editorKind: PropertyEditorKind.Slice, editorOptions: { kinds: ['StateChange'] },
                description: 'Only State Change slices can be picked. State Views and Automations never take user input, so they are listed as unavailable.',
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
                path: 'confirm', label: 'Confirmation', group: 'Behavior', valueType: PropertyValueType.String,
                description: 'Optional question the user answers before the button runs its command or opens its dialog. Empty means it runs at once.',
            },
            {
                path: 'presentation', label: 'Presentation', group: 'Appearance', valueType: PropertyValueType.Object, open: true,
                description: 'How the item is shown: what it displays (icon, text or both) and the placement hint a host or theme can style by. Hints other than these are kept as authored.',
                properties: [
                    {
                        path: 'mode', label: 'Shows', group: 'Appearance', valueType: PropertyValueType.Enum, default: 'both', editorKind: PropertyEditorKind.Enum,
                        choices: [{ value: 'both', label: 'Icon and text' }, { value: 'icon', label: 'Icon only' }, { value: 'text', label: 'Text only' }],
                    },
                    { path: 'placement', label: 'Placement', group: 'Appearance', valueType: PropertyValueType.String, description: 'A hint such as `primary` or `overflow` a host or theme can place the item by.' },
                ],
            },
            {
                path: 'target', label: 'Command (legacy)', group: 'Behavior', valueType: PropertyValueType.String, editorKind: 'stateChangeReference',
                description: 'A hand-typed command for a button that has no slice. It is converted to the slice that accepts the command when exactly one does; prefer a slice.',
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
        component: key('outlet'),
        displayName: 'Outlet',
        description: 'A named region another screen opens into. Placing a screen here keeps this screen on the page, and the placed screen may declare outlets of its own.',
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