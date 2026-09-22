// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { arrayProperty, booleanProperty, objectProperty, stringProperty } from '../properties';

/** Package-local web input declaration, not a Scene.Model form or binding expression. */
export interface QueryInput {
    /** Exact generated query argument name. */
    parameter: string;
    type: 'string';
    label: string;
    /** Defaults to true. Required strings must contain a non-whitespace character. */
    required?: boolean;
    /** Optional whole-value JavaScript Unicode regular expression (without delimiters). */
    pattern?: string;
}

/** Reject the entire declaration rather than silently dropping malformed inputs. */
export function queryInputs(properties: Record<string, unknown>): QueryInput[] | undefined {
    const values = arrayProperty(properties, 'inputs');
    if (!values?.length) return undefined;
    const inputs: QueryInput[] = [];
    const parameters = new Set<string>();
    for (const value of values) {
        const input = objectProperty({ value }, 'value');
        if (!input) return undefined;
        const parameter = stringProperty(input, 'parameter');
        const label = stringProperty(input, 'label');
        const required = booleanProperty(input, 'required');
        const pattern = stringProperty(input, 'pattern');
        if (!parameter || !label || input.type !== 'string' || parameters.has(parameter)
            || (input.required !== undefined && required === undefined)
            || (input.pattern !== undefined && pattern === undefined)) return undefined;
        if (pattern !== undefined) {
            try { new RegExp(`^(?:${pattern})$`, 'u'); } catch { return undefined; }
        }
        parameters.add(parameter);
        inputs.push({ parameter, type: 'string', label, required: required ?? true, pattern });
    }
    return inputs;
}

/** Validation never transforms the submitted string; proxy validators remain authoritative. */
export function queryInputError(input: QueryInput, value: string): string | undefined {
    if (input.required && !/\S/u.test(value)) return `${input.label} is required`;
    if (input.pattern !== undefined && !new RegExp(`^(?:${input.pattern})$`, 'u').test(value)) {
        return `${input.label} has an invalid format`;
    }
    return undefined;
}
