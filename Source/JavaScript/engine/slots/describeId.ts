// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Names the id of an element, action or button in a message; one that has none reads `(no id)`, as the items of an outlet do.
 * @param value The id as the document holds it.
 * @returns The id, or `(no id)`.
 */
export function describeId(value: unknown): string {
    return value === undefined || value === null ? '(no id)' : String(value);
}
