// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { QueryBinding, QueryCandidate, QueryParameter, QueryResultField } from '@cratis/scene.model';

// A fresh binding to a candidate query, with every required parameter listed and no source chosen yet.
export function bindToCandidate(candidate: QueryCandidate): QueryBinding {
    return { queryId: candidate.id, query: candidate.name, arguments: [], results: [] };
}

// Whether a stored value is a query binding (the shape a `queryReference` property holds).
export function isQueryBinding(value: unknown): value is QueryBinding {
    const binding = value as Partial<QueryBinding> | null | undefined;
    return !!binding && typeof binding === 'object' && typeof binding.queryId === 'string' && Array.isArray(binding.arguments) && Array.isArray(binding.results);
}

// Maps one parameter to the place its value comes from. An empty source removes the mapping.
export function mapParameter(binding: QueryBinding, parameter: string, sourcePath: string): QueryBinding {
    const rest = binding.arguments.filter(argument => argument.parameter !== parameter);
    return { ...binding, arguments: sourcePath.trim() === '' ? rest : [...rest, { parameter, source: { path: sourcePath.trim() } }] };
}

// Shows a result field as a column of the table. The column is named after the field unless a target is given.
export function mapColumn(binding: QueryBinding, field: string, target = field): QueryBinding {
    return binding.results.some(result => result.field === field)
        ? binding
        : { ...binding, results: [...binding.results, { target, field }] };
}

// Shows a result field as a column at a position among the columns, or moves the column when it is shown already. The position is one among the columns as they are.
export function placeColumn(binding: QueryBinding, field: string, index: number | undefined, target = field): QueryBinding {
    const current = binding.results.findIndex(result => result.field === field);
    const without = binding.results.filter(result => result.field !== field);
    const entry = current >= 0 ? binding.results[current] : { target, field };
    const wanted = index === undefined ? (current >= 0 ? current : without.length) : (current >= 0 && current < index ? index - 1 : index);
    const at = Math.max(0, Math.min(without.length, wanted));
    return { ...binding, results: [...without.slice(0, at), entry, ...without.slice(at)] };
}

export function unmapColumn(binding: QueryBinding, field: string): QueryBinding {
    return { ...binding, results: binding.results.filter(result => result.field !== field) };
}

export const sourceOf = (binding: QueryBinding, parameter: QueryParameter): string =>
    binding.arguments.find(argument => argument.parameter === parameter.name)?.source.path ?? '';

export const isColumnShown = (binding: QueryBinding, field: QueryResultField): boolean =>
    binding.results.some(result => result.field === field.name);
