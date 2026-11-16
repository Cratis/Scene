// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Screen } from '@cratis/scene.model';
import type { SliceCommandField } from '@cratis/scene.react';

interface SchemaDefinition {
    type?: string | string[];
    format?: string;
    'x-generated'?: unknown;
}

const humanize = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, first => first.toUpperCase());

function fieldTypeOf(definition: SchemaDefinition | undefined): string | undefined {
    const declared = Array.isArray(definition?.type) ? definition.type.filter(type => type !== 'null') : [definition?.type];
    if (declared.length !== 1) return undefined;
    const type = declared[0];
    if (type === 'integer' || type === 'number') return 'number';
    if (type === 'boolean') return 'boolean';
    if (definition?.format === 'date' || definition?.format === 'date-time') return 'date';
    if (type === undefined || type === 'string') return 'string';
    return undefined;
}

/**
 * The fields of a command, for the task dialog a toolbar slice button opens, read from the command's JSON schema the way Stage's native command
 * form reads it: a number, a boolean, a date or a string each as that, a property the form cannot present (a collection, an object, a union)
 * left out rather than shown as a field that cannot be filled, and a property required unless the schema lists what is. An identifier the
 * command generates (`x-generated`) is never asked for.
 *
 * When the slice's own screen declares a form for the command, the dialog is that form - its fields in its order, with its labels - as the screen
 * editor draws it, so the preview shows what was designed.
 *
 * @param schemas The JSON schema of every modeled command, by command name.
 * @param screens The screens of the application, which hold the forms the slices declare.
 * @returns The fields of a command; none for a command the application does not describe.
 */
export function commandFieldsOfSchemas(schemas: Record<string, string> | undefined, screens: readonly Screen[] = []): (command: string, slice?: string) => SliceCommandField[] {
    return (command, slice) => {
        const fields = schemaFieldsOf(schemas?.[command]);
        const form = formOf(screens, command, slice);
        if (!form || form.fields.length === 0) return fields;
        return form.fields.flatMap(field => {
            const property = field.sourceProperty ?? field.name;
            const known = fields.find(candidate => candidate.name === property);
            return known ? [{ ...known, ...(field.label ? { label: field.label } : {}) }] : [];
        });
    };
}

function schemaFieldsOf(schema: string | undefined): SliceCommandField[] {
    if (!schema) return [];
    try {
        const parsed = JSON.parse(schema) as { required?: unknown; properties?: Record<string, SchemaDefinition> };
        const listsRequired = Object.prototype.hasOwnProperty.call(parsed, 'required');
        const required = new Set(Array.isArray(parsed.required) ? parsed.required.filter((name): name is string => typeof name === 'string') : []);
        return Object.entries(parsed.properties ?? {}).flatMap(([name, definition]) => {
            if (definition?.['x-generated'] === true) return [];
            const type = fieldTypeOf(definition);
            return type === undefined ? [] : [{ name, type, label: humanize(name), required: listsRequired ? required.has(name) : true }];
        });
    } catch {
        return [];
    }
}

// The form a slice's own screen declares for its command; any screen's form for it when the dialog names no slice.
function formOf(screens: readonly Screen[], command: string, slice: string | undefined) {
    const owned = slice ? screens.filter(screen => screen.owner === slice) : [];
    const candidates = owned.length > 0 ? owned : screens;
    return candidates.flatMap(screen => screen.forms).find(form => form.forCommand === command);
}
