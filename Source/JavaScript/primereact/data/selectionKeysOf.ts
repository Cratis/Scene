// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** The keys of one node, whichever of the shapes a selection may use. */
function keyOf(value: unknown): string | undefined {
    if (typeof value === 'string' && value !== '') return value;
    return typeof value === 'number' && Number.isFinite(value) ? String(value) : undefined;
}

function nodeKeyOf(value: unknown): string | undefined {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return keyOf(value);
    return keyOf((value as { key?: unknown }).key);
}

/**
 * Reads the keys an authored `selection` selects.
 *
 * Every shape a legacy document may hold is accepted, and none is rewritten:
 * - one key, string or number (`'b'`, `6`);
 * - an array mixing keys and `{ key }` objects (`['a', 6, { key: 'c' }]`);
 * - one `{ key }` object;
 * - PrimeReact's key map (`{ b: { checked: true, partialChecked: false } }`), whose `checked` entries are
 *   selected. A `partialChecked` entry is derived state, not a selection, so it is ignored: the control
 *   computes it from the selected descendants.
 *
 * Numeric keys are matched as the strings the tree builds from them.
 *
 * @param value The authored selection.
 */
export function selectionKeysOf(value: unknown): Set<string> {
    if (Array.isArray(value)) return new Set(value.flatMap(entry => nodeKeyOf(entry) ?? []));
    const single = nodeKeyOf(value);
    if (single !== undefined) return new Set([single]);

    if (typeof value === 'object' && value !== null && keyOf((value as { key?: unknown }).key) === undefined) {
        return new Set(Object.entries(value).filter(([, state]) => (state as { checked?: unknown } | null)?.checked === true).map(([key]) => key));
    }

    return new Set();
}
