// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, PropertyValueType } from '@cratis/scene.model';
import { componentRegistryKey } from '../packages';

const key = (name: string) => componentRegistryKey('core', name);

/**
 * What can be edited on the `core` package's components.
 *
 * Only the components an author configures by hand are described: a button's label, an action's command and its
 * argument mapping, a column's heading, and the navigation bar. The Screenplay structural components - `data`,
 * `section`, `summary` - have nothing to edit that is not already a node in the tree.
 */
export const coreDescriptors: ComponentDescriptor[] = [
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
        component: key('column'),
        displayName: 'Table column',
        properties: [
            { path: 'property', label: 'Result field', group: 'Data', valueType: PropertyValueType.String, editorKind: 'resultField', constraints: { required: true } },
            { path: 'label', label: 'Heading', group: 'Content', valueType: PropertyValueType.String },
        ],
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
