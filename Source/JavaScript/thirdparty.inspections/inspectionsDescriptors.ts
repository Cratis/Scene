// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, DesignTimeActionPlacement, PropertyValueType } from '@cratis/scene.model';
import { inspectionChecklistComponent } from './packageName';

/** The identity of the package's Generate fields action. */
export const generateChecklistItemsActionId = 'Acme.Inspections.checklist.generateFields';

/**
 * What a designer may edit on the checklist, and which of this package's design-time extensions it uses.
 * Every name below is resolved by the host's generic lookups - no host knows this package by name.
 */
export const inspectionChecklistDescriptor: ComponentDescriptor = {
    component: inspectionChecklistComponent,
    displayName: 'Inspection checklist',
    description: 'A checklist whose items mirror the properties of the command that records the inspection.',
    editorKind: 'checklistDesigner',
    previewKind: 'checklistPreview',
    propertyDisplayKind: 'severityBadge',
    properties: [
        { path: 'title', label: 'Title', group: 'Content', valueType: PropertyValueType.String },
        { path: 'command', label: 'Command', group: 'Command', valueType: PropertyValueType.String },
        { path: 'icon', label: 'Icon', group: 'Content', valueType: PropertyValueType.String, editorKind: 'icon' },
        {
            path: 'severity', label: 'Severity', group: 'Content', valueType: PropertyValueType.Enum,
            choices: [{ value: 'low', label: 'Low' }, { value: 'high', label: 'High' }],
        },
        {
            path: 'items', label: 'Items', group: 'Content', valueType: PropertyValueType.Collection, editorKind: 'checklistItems',
            item: {
                label: 'item',
                properties: [
                    { path: 'label', label: 'Label', group: 'Item', valueType: PropertyValueType.String },
                    { path: 'required', label: 'Required', group: 'Item', valueType: PropertyValueType.Boolean },
                ],
            },
        },
    ],
    actions: [{
        id: generateChecklistItemsActionId,
        label: 'Generate fields',
        placement: DesignTimeActionPlacement.Toolbar,
        availability: 'checklist.commandBound',
        description: 'Creates one checklist item per property of the bound command.',
    }],
};
