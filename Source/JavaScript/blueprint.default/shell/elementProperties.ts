// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';

/**
 * Typed reads out of a {@link SceneElement}'s open `properties` bag.
 *
 * The bag is `Record<string, unknown>` by design - it carries whatever a page template author wrote, and
 * Scene never re-validates it. A shell component that trusts it and reads `properties.label as string`
 * renders `[object Object]` or crashes the moment a template has a typo, so every read goes through one of
 * these instead and falls back to something renderable.
 */

/** Reads a string property, or the fallback when it is absent or not a string. */
export function readString(element: ExternalComponent, name: string, fallback = ''): string {
    const value = element.properties[name];
    return typeof value === 'string' ? value : fallback;
}

/** Reads an optional string property, or `undefined` when it is absent or not a string. */
export function readOptionalString(element: ExternalComponent, name: string): string | undefined {
    const value = element.properties[name];
    return typeof value === 'string' ? value : undefined;
}

/** Reads a boolean property, or the fallback when it is absent or not a boolean. */
export function readBoolean(element: ExternalComponent, name: string, fallback = false): boolean {
    const value = element.properties[name];
    return typeof value === 'boolean' ? value : fallback;
}

/** Reads a number property, or the fallback when it is absent or not a number. */
export function readNumber(element: ExternalComponent, name: string, fallback = 0): number {
    const value = element.properties[name];
    return typeof value === 'number' ? value : fallback;
}

/** Reads an array of strings, or an empty array when the property is absent or holds anything else. */
export function readStrings(element: ExternalComponent, name: string): string[] {
    const value = element.properties[name];
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

/**
 * Reads an array of objects - a breadcrumb trail, a set of table columns, a user menu's items.
 *
 * Entries that are not objects are dropped rather than rendered, for the same reason the scalar reads
 * fall back: half a table is a better failure than a thrown render.
 */
export function readRecords(element: ExternalComponent, name: string): Record<string, unknown>[] {
    const value = element.properties[name];
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null && !Array.isArray(entry));
}

/** Reads a string out of one of {@link readRecords}' entries. */
export function recordString(record: Record<string, unknown>, name: string, fallback = ''): string {
    const value = record[name];
    return typeof value === 'string' ? value : fallback;
}
