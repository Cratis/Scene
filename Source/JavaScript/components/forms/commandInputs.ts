// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { arrayProperty, objectProperty, stringProperty } from '../properties';

/** Exact, case-sensitive names from a generated command's propertyDescriptors. */
export interface CommandInput {
    property: string;
    type: 'string' | 'guid';
    label: string;
}

/** An absent declaration selects legacy auto mode; a present but invalid declaration never does. */
export function commandInputs(properties: Record<string, unknown>): CommandInput[] | undefined {
    const values = arrayProperty(properties, 'inputs');
    if (!values?.length) return undefined;
    const inputs: CommandInput[] = [];
    const seen = new Set<string>();
    for (const value of values) {
        const input = objectProperty({ value }, 'value');
        if (!input || Object.keys(input).some(key => !['property', 'type', 'label'].includes(key))) return undefined;
        const property = stringProperty(input, 'property');
        const label = stringProperty(input, 'label');
        if (!property?.trim() || !label?.trim() || (input.type !== 'string' && input.type !== 'guid') || seen.has(property)) return undefined;
        seen.add(property);
        inputs.push({ property, type: input.type, label });
    }
    return inputs;
}
