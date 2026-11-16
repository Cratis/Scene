// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, type OutletFilter, type QueryBinding, type Slot } from '@cratis/scene.model';
import { mapParameter } from './queryBindingModel';

// A filter of an outlet of filters that sets one parameter of a query: what feeds the parameter from the filters the author sees.
export interface FilterFeed {
    outlet: string;
    id: string;
    title: string;
}

// An item of an outlet as the outlet design lists it: its id and title, and the values it carries.
export interface ListedItem {
    id: string;
    label: string;
    values: Record<string, unknown>;
}

const setsOf = (item: ListedItem): { query: string; parameter: string } | undefined => {
    const sets = item.values.sets;
    return sets !== null && typeof sets === 'object' && typeof (sets as { query?: unknown }).query === 'string' && typeof (sets as { parameter?: unknown }).parameter === 'string'
        ? sets as { query: string; parameter: string }
        : undefined;
};

// The filters of an outlet that set the parameter of the query.
export function filtersSetting(outlet: string, items: readonly ListedItem[], query: string, parameter: string): FilterFeed[] {
    return items
        .filter(item => item.values.kind === OutletItemKind.Filter && setsOf(item)?.query === query && setsOf(item)?.parameter === parameter)
        .map(item => ({ outlet, id: item.id, title: item.label }));
}

// The filters that set any parameter of the query - what a stat bound to a field of it follows.
export const filtersSettingQuery = (items: readonly ListedItem[], query: string): ListedItem[] =>
    items.filter(item => item.values.kind === OutletItemKind.Filter && setsOf(item)?.query === query);

// A filter that sets a parameter of a query, titled after the parameter.
export function filterFor(query: string, parameter: string, id: string): OutletFilter {
    return { kind: OutletItemKind.Filter, id, title: parameter.charAt(0).toUpperCase() + parameter.slice(1), sets: { query, parameter } };
}

// A value a routed slot is addressed by: the page keeps it in its address, and a query can be fed from it.
export interface RoutedValue {
    slot: string;
    parameter: string;

    // Where a binding reads it, the way the binding sources name route values.
    path: string;
}

export function routedValuesOf(slots: readonly Slot[]): RoutedValue[] {
    return slots.filter(slot => slot.routed === true).flatMap(slot => (slot.routedBy ?? []).map(parameter => ({ slot: slot.name, parameter, path: `route.${parameter}` })));
}

// The route value a parameter is mapped to by hand, when it is one of the values of the routed slots.
export const mappedRouteOf = (binding: QueryBinding, parameter: string, values: readonly RoutedValue[]): RoutedValue | undefined => {
    const path = binding.arguments.find(argument => argument.parameter === parameter)?.source.path;
    return values.find(value => value.path === path);
};

// Maps a parameter to a route value of a routed slot, or takes the mapping off when no value is given.
export const withRouteSource = (binding: QueryBinding, parameter: string, value: RoutedValue | undefined): QueryBinding => mapParameter(binding, parameter, value?.path ?? '');
