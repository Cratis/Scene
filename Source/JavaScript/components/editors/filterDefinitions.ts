// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FilterDefinition, FilterOption, FilterValue } from '@cratis/components/Filter';
import { booleanProperty, numberProperty, objectArrayProperty, stringProperty, unionProperty } from '../properties';

/** The value kinds a filter can be declared over. */
const filterTypes = ['string', 'number', 'date', 'custom'] as const;

/**
 * Reads a `filters` property into the `FilterDefinition` list `FilterPanel` renders.
 *
 * A definition needs a `key` and a `label`; an entry without both is dropped, since a filter with no key
 * has nothing to filter on and one with no label cannot be shown. Everything else is optional and falls
 * through to the panel's own defaults.
 */
export function filterDefinitions(properties: Record<string, unknown>): FilterDefinition[] {
    const entries = objectArrayProperty(properties, 'filters') ?? [];

    return entries
        .map((entry): FilterDefinition | undefined => {
            const key = stringProperty(entry, 'key');
            const label = stringProperty(entry, 'label');
            if (key === undefined || label === undefined) return undefined;

            return {
                key,
                label,
                type: unionProperty(entry, 'type', filterTypes),
                multi: booleanProperty(entry, 'multi'),
                options: filterOptions(entry),
                searchable: booleanProperty(entry, 'searchable'),
                searchPlaceholder: stringProperty(entry, 'searchPlaceholder'),
                buckets: numberProperty(entry, 'buckets'),
            };
        })
        .filter((definition): definition is FilterDefinition => definition !== undefined);
}

/**
 * Reads one filter's selectable options. An option's `value` is what gets applied and its `key` is what
 * the panel tracks selection by; `value` falls back to the key so the common case of a plain string
 * choice needs only `key` and `label`.
 */
function filterOptions(entry: Record<string, unknown>): FilterOption[] | undefined {
    const options = objectArrayProperty(entry, 'options');
    if (options === undefined) return undefined;

    return options
        .map((option): FilterOption | undefined => {
            const key = stringProperty(option, 'key');
            const label = stringProperty(option, 'label');
            if (key === undefined || label === undefined) return undefined;

            const value: FilterValue = stringProperty(option, 'value') ?? numberProperty(option, 'value') ?? booleanProperty(option, 'value') ?? key;
            return { key, label, value, count: numberProperty(option, 'count') };
        })
        .filter((option): option is FilterOption => option !== undefined);
}
