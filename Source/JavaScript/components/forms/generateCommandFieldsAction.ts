// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignTimeAction, DesignTimeActionContext, DesignTimeActionResult } from '@cratis/scene.react';
import { DesignTimeActionPlacement, SceneEditKind } from '@cratis/scene.model';

export const generateCommandFieldsAction: DesignTimeAction = {
    descriptor: {
        id: 'Cratis.Components.commandForm.generateFields',
        label: 'Generate fields',
        placement: DesignTimeActionPlacement.Toolbar,
        availability: 'commandForm.canGenerateFields',
        description: 'Creates a deterministic editable field layout from the selected command metadata.',
    },
    isVisible: context => context.element.componentName.endsWith(':commandForm'),
    isEnabled: context => Array.isArray(context.commandMetadata?.properties) && context.element.properties.inputs === undefined,
    execute: context => generateCommandFields(context),
};

function generateCommandFields(context: DesignTimeActionContext): DesignTimeActionResult {
    const properties = context.commandMetadata?.properties ?? [];
    if (!properties.length) return { edits: [], diagnostics: ['No command metadata was supplied.'] };
    // Authored fields, or a binding that supplies them, are never overwritten.
    if (Array.isArray(context.element.properties.inputs)) {
        return { edits: [], diagnostics: ['The form already has authored fields; Generate fields will not overwrite them.'] };
    }
    if (context.element.properties.inputs !== undefined) {
        return { edits: [], diagnostics: ['The form\'s fields come from a binding; Generate fields will not overwrite it.'] };
    }

    return {
        diagnostics: [],
        edits: [{
            kind: SceneEditKind.SetProperty,
            nodeId: context.element.id,
            path: 'inputs',
            value: properties.map((property, index) => ({
                property: property.name,
                type: property.type === 'Guid' || property.type === 'guid' ? 'guid' : 'string',
                label: property.label ?? humanize(property.name),
                column: (index % 2) + 1,
                width: '1fr',
            })),
        }],
    };
}

function humanize(name: string): string {
    return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, value => value.toUpperCase());
}
