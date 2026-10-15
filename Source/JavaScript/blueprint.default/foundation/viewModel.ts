// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** One saved view of a list: a named combination of filters, sort and columns. The definition lives with the application. */
export interface SavedView {
    id: string;
    label: string;
    description?: string;
}

/** Reads saved views out of a property value, dropping entries without an id. */
export function readViews(value: unknown): SavedView[] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((entry): SavedView[] => {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [];
        const { id, label, description } = entry as Record<string, unknown>;
        if (typeof id !== 'string' || id.length === 0) return [];
        return [{ id, label: typeof label === 'string' && label.length > 0 ? label : id, ...(typeof description === 'string' ? { description } : {}) }];
    });
}
