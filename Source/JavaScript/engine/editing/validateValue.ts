// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingSourceKind, CollectionItemDescriptor, PropertyDescriptor, PropertyValueType } from '@cratis/scene.model';

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
}

/**
 * Checks a value against a property descriptor.
 *
 * @param descriptor The property the value is for.
 * @param value The value to check. `undefined` means "not set", which is fine unless the property is required.
 * @returns The reason the value is not acceptable, or `undefined` when it is.
 */
export function validateValue(descriptor: PropertyDescriptor, value: unknown): string | undefined {
    const constraints = descriptor.constraints ?? {};
    if (value === undefined || value === null) {
        return constraints.required ? 'a value is required' : undefined;
    }

    const binding = bindingKindOf(value);
    if (binding !== undefined && descriptor.acceptedBindingKinds !== undefined) {
        return descriptor.acceptedBindingKinds.includes(binding.kind)
            ? undefined
            : `a ${binding.kind} binding is not accepted here; use ${descriptor.acceptedBindingKinds.join(' or ')}`;
    }

    switch (descriptor.valueType) {
        case PropertyValueType.String: {
            if (typeof value !== 'string') return 'expected a string';
            if (constraints.minimumLength !== undefined && value.length < constraints.minimumLength) return `must be at least ${constraints.minimumLength} characters`;
            if (constraints.maximumLength !== undefined && value.length > constraints.maximumLength) return `must be at most ${constraints.maximumLength} characters`;
            if (constraints.pattern !== undefined && !new RegExp(`^(?:${constraints.pattern})$`).test(value)) return `must match ${constraints.pattern}`;
            return undefined;
        }

        case PropertyValueType.Number: {
            if (typeof value !== 'number' || !Number.isFinite(value)) return 'expected a number';
            if (constraints.integer && !Number.isInteger(value)) return 'expected a whole number';
            if (constraints.minimum !== undefined && value < constraints.minimum) return `must be at least ${constraints.minimum}`;
            if (constraints.maximum !== undefined && value > constraints.maximum) return `must be at most ${constraints.maximum}`;
            return undefined;
        }

        case PropertyValueType.Boolean:
            return typeof value === 'boolean' ? undefined : 'expected true or false';

        case PropertyValueType.Enum:
            return (descriptor.choices ?? []).some(choice => choice.value === value) ? undefined : 'not one of the allowed choices';

        case PropertyValueType.Icon:
            if (!isRecord(value) || !isNonEmptyString(value.library) || !isNonEmptyString(value.key)) return 'expected an icon reference with a library and a key';
            return value.variant === undefined || typeof value.variant === 'string' ? undefined : 'the icon variant must be a string';

        case PropertyValueType.Destination:
            if (!isRecord(value) || !isNonEmptyString(value.screen)) return 'expected a destination naming a screen';
            return value.routeParameterBindings === undefined || isRecord(value.routeParameterBindings)
                ? undefined
                : 'routeParameterBindings must be an object';

        case PropertyValueType.QueryReference:
            if (isNonEmptyString(value)) return undefined;
            if (!isRecord(value) || !isNonEmptyString(value.queryId) || !isNonEmptyString(value.query)) return 'expected a query name or a query binding';
            return Array.isArray(value.arguments) && Array.isArray(value.results) ? undefined : 'a query binding needs arguments and results lists';

        case PropertyValueType.Collection:
            return validateCollection(descriptor, value);

        case PropertyValueType.Json:
            return isJsonValue(value) ? undefined : 'expected a JSON value';

        default:
            return isRecord(value) || Array.isArray(value) ? undefined : 'expected a structured value';
    }
}

/**
 * The deepest nesting a JSON value may have. Authored configuration (chart datasets, option lists) is shallow;
 * the limit turns a runaway or hostile structure into a validation message instead of a stack overflow.
 */
const bindingKinds = new Set<string>(Object.values(BindingSourceKind));

/**
 * The source kind of a value that is a typed binding expression - an object with a known `kind` and a
 * string `path` - rather than a value of the property's own type. Only consulted for properties that declare
 * `acceptedBindingKinds`, so a collection property such as a command form's `inputs` can be bound to a
 * table's `selectedItem` instead of listing its items.
 */
function bindingKindOf(value: unknown): { kind: BindingSourceKind } | undefined {
    if (!isRecord(value) || typeof value.kind !== 'string' || !bindingKinds.has(value.kind) || typeof value.path !== 'string') return undefined;
    return { kind: value.kind as BindingSourceKind };
}

const maximumJsonDepth = 64;

/**
 * Whether a value is JSON: `null`, a string, a boolean, a finite number, or an array or plain object of those.
 * The value is only inspected, never serialized, so what an editor stores is exactly what was passed in.
 */
function isJsonValue(value: unknown, parents = new Set<object>()): boolean {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value !== 'object' || parents.has(value) || parents.size >= maximumJsonDepth) return false;

    const isArray = Array.isArray(value);
    const prototype = Object.getPrototypeOf(value);
    if (isArray ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) return false;

    parents.add(value);
    const values = isArray ? Array.from({ length: value.length }, (_, index) => (index in value ? value[index] : undefined)) : Object.values(value);
    const valid = values.every(candidate => isJsonValue(candidate, parents));
    parents.delete(value);
    return valid;
}

function validateCollection(descriptor: PropertyDescriptor, value: unknown): string | undefined {
    if (!Array.isArray(value)) return 'expected a list';
    const constraints = descriptor.constraints ?? {};
    if (constraints.minimumItems !== undefined && value.length < constraints.minimumItems) return `needs at least ${constraints.minimumItems} items`;
    if (constraints.maximumItems !== undefined && value.length > constraints.maximumItems) return `allows at most ${constraints.maximumItems} items`;

    const identities = new Set<string>();
    for (const item of value) {
        if (!isRecord(item) || !isNonEmptyString(item.id)) return 'every item needs an id';
        if (identities.has(item.id)) return `the item id '${item.id}' is used twice`;
        identities.add(item.id);

        const { id: _identity, ...values } = item;
        const problem = validateItemValues(descriptor.item, values).at(0);
        if (problem) return `item '${item.id}': ${problem.field} ${problem.problem}`;
    }

    return undefined;
}

/**
 * One field of a collection item that does not fit its descriptor.
 */
export interface ItemFieldProblem {
    field: string;
    problem: string;
}

/**
 * Checks a collection item's field values against the collection's item descriptor.
 *
 * @param itemDescriptor What the items look like.
 * @param values The item's field values, keyed by field path.
 * @returns Every field that is unknown or has an unacceptable value.
 */
export function validateItemValues(itemDescriptor: CollectionItemDescriptor | undefined, values: Record<string, unknown>): ItemFieldProblem[] {
    const fields = itemDescriptor?.properties ?? [];
    const problems: ItemFieldProblem[] = [];

    for (const [field, fieldValue] of Object.entries(values)) {
        const fieldDescriptor = fields.find(candidate => candidate.path === field);
        if (!fieldDescriptor) {
            problems.push({ field, problem: 'is not a field of this collection\'s items' });
            continue;
        }

        const problem = validateValue(fieldDescriptor, fieldValue);
        if (problem) problems.push({ field, problem });
    }

    for (const fieldDescriptor of fields) {
        if (fieldDescriptor.constraints?.required && values[fieldDescriptor.path] === undefined) {
            problems.push({ field: fieldDescriptor.path, problem: 'a value is required' });
        }
    }

    return problems;
}
