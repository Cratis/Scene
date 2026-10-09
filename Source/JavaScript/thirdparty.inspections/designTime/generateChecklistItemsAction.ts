// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from '@cratis/scene.model';
import { DesignTimeAction, DesignTimeActionContext, DesignTimeActionResult } from '@cratis/scene.react';
import { generateChecklistItemsActionId, inspectionChecklistDescriptor } from '../inspectionsDescriptors';
import { inspectionChecklistComponent } from '../packageName';

/**
 * Generate fields: one checklist item per property of the bound command. Visible on checklists only, enabled
 * once a command is bound and its metadata is known, and never overwriting items someone authored.
 */
export const generateChecklistItemsAction: DesignTimeAction = {
    descriptor: inspectionChecklistDescriptor.actions!.find(action => action.id === generateChecklistItemsActionId)!,
    isVisible: context => context.element.componentName === inspectionChecklistComponent,
    isEnabled: context =>
        typeof context.element.properties.command === 'string' &&
        (context.commandMetadata?.properties.length ?? 0) > 0 &&
        !Array.isArray(context.element.properties.items),
    execute: generateItems,
};

function generateItems(context: DesignTimeActionContext): DesignTimeActionResult {
    const properties = context.commandMetadata?.properties ?? [];
    if (Array.isArray(context.element.properties.items)) {
        return { edits: [], diagnostics: ['The checklist already has authored items; Generate fields will not overwrite them.'] };
    }

    if (properties.length === 0) return { edits: [], diagnostics: ['No command metadata was supplied.'] };

    return {
        diagnostics: [],
        edits: [{
            kind: SceneEditKind.SetProperty,
            nodeId: context.element.id,
            path: 'items',
            value: properties.map(property => ({
                id: `${context.element.id}.${property.name}`,
                property: property.name,
                label: property.label ?? property.name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, first => first.toUpperCase()),
                required: true,
            })),
        }],
    };
}
