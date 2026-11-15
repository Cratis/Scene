// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The earlier prototype serializer cannot read null values. Filter only its derived preview payload; the Scene document
// remains untouched and retains nulls as authored.
export function withoutNulls<T>(value: T): T {
    if (Array.isArray(value)) return value.filter(item => item !== null).map(withoutNulls) as unknown as T;
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([, item]) => item !== null).map(([key, item]) => [key, withoutNulls(item)])) as T;
    }

    return value;
}
