// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What a filterable field holds, which decides the operators offered for it. */
export enum FilterFieldType {
    Text = 'text',
    Number = 'number',
    Date = 'date',
    Select = 'select',
    Boolean = 'boolean',
}

/** A field a filter can be built on. */
export interface FilterField {
    name: string;
    label: string;
    type: FilterFieldType;
    options: string[];
}

/** One test of a field. */
export interface FilterCondition {
    field: string;
    operator: string;
    value: string;
}

/** Conditions and nested groups joined by AND or OR. */
export interface FilterGroup {
    operator: 'and' | 'or';
    conditions: FilterCondition[];
    groups: FilterGroup[];
}

/** The deepest a group may nest; deeper filters are unreadable, and a runaway value is cut rather than rendered forever. */
export const maximumFilterDepth = 3;

/** An empty group. */
export const emptyFilter = (): FilterGroup => ({ operator: 'and', conditions: [], groups: [] });

/** The operators of each field type, in the order they are offered; the first is the default. */
export const filterOperators: Record<FilterFieldType, string[]> = {
    [FilterFieldType.Text]: ['contains', 'equals', 'notEquals', 'startsWith', 'isEmpty'],
    [FilterFieldType.Number]: ['equals', 'notEquals', 'greater', 'greaterOrEqual', 'less', 'lessOrEqual'],
    [FilterFieldType.Date]: ['on', 'before', 'after'],
    [FilterFieldType.Select]: ['is', 'isNot'],
    [FilterFieldType.Boolean]: ['true', 'false'],
};

/** The operators that need no value to compare with. */
export const valuelessOperators = ['isEmpty', 'true', 'false'];

/** Reads fields out of a property value, dropping entries without a name, and defaulting what is unknown to text. */
export function readFilterFields(value: unknown): FilterField[] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((entry): FilterField[] => {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [];
        const { name, label, type, options } = entry as Record<string, unknown>;
        if (typeof name !== 'string' || name.length === 0) return [];
        return [{
            name,
            label: typeof label === 'string' && label.length > 0 ? label : name,
            type: (Object.values(FilterFieldType) as string[]).includes(type as string) ? (type as FilterFieldType) : FilterFieldType.Text,
            options: Array.isArray(options) ? options.filter((option): option is string => typeof option === 'string') : [],
        }];
    });
}

/** Reads a filter out of a property value, keeping the conditions on known fields with operators their type offers. */
export function normalizeFilter(value: unknown, fields: FilterField[], depth = 1): FilterGroup {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return emptyFilter();

    const { operator, conditions, groups } = value as Record<string, unknown>;
    return {
        operator: operator === 'or' ? 'or' : 'and',
        conditions: Array.isArray(conditions) ? conditions.flatMap((entry): FilterCondition[] => {
            if (typeof entry !== 'object' || entry === null) return [];
            const condition = entry as Record<string, unknown>;
            const field = fields.find(candidate => candidate.name === condition.field);
            if (!field) return [];
            const operators = filterOperators[field.type];
            return [{
                field: field.name,
                operator: typeof condition.operator === 'string' && operators.includes(condition.operator) ? condition.operator : operators[0],
                value: typeof condition.value === 'string' ? condition.value : typeof condition.value === 'number' ? String(condition.value) : '',
            }];
        }) : [],
        groups: depth < maximumFilterDepth && Array.isArray(groups) ? groups.map(group => normalizeFilter(group, fields, depth + 1)) : [],
    };
}

/** How many conditions are in force: a condition that needs a value and has none is not filtering anything. */
export function countActiveConditions(group: FilterGroup): number {
    const own = group.conditions.filter(condition => valuelessOperators.includes(condition.operator) || condition.value.trim().length > 0).length;
    return own + group.groups.reduce((sum, nested) => sum + countActiveConditions(nested), 0);
}

/** Applies a change to the group at a path of nested group indexes, leaving the rest as it was. */
export function updateGroupAt(root: FilterGroup, path: number[], change: (group: FilterGroup) => FilterGroup): FilterGroup {
    if (path.length === 0) return change(root);

    const [index, ...rest] = path;
    return { ...root, groups: root.groups.map((group, position) => (position === index ? updateGroupAt(group, rest, change) : group)) };
}

/** A new condition on the first field, with that field's default operator. */
export function newCondition(fields: FilterField[]): FilterCondition {
    const field = fields[0];
    return { field: field?.name ?? '', operator: field ? filterOperators[field.type][0] : 'contains', value: '' };
}
