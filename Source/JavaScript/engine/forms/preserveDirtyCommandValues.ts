// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Merges refreshed command values without overwriting dirty fields a user is editing.
 */
export function preserveDirtyCommandValues(
    current: Record<string, unknown>,
    refreshed: Record<string, unknown>,
    dirtyFields: ReadonlySet<string>,
): Record<string, unknown> {
    return Object.fromEntries(Object.entries(refreshed).map(([field, value]) => [field, dirtyFields.has(field) ? current[field] : value]));
}
