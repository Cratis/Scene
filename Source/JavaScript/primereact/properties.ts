// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { SelectOption } from './SelectOption';

/**
 * Reads a string configuration value off a Scene element.
 *
 * `SceneElement.properties` is `Record<string, unknown>` because a screen's properties come from
 * authored model data, not from a compiler that knows this package's expectations. Every adapter
 * therefore has to narrow before it can use a value, and doing that with a cast would defeat the point -
 * a mistyped property would sail through and blow up inside PrimeReact instead of quietly falling back
 * here. These helpers are the single narrowing point, so a wrong type behaves exactly like an absent
 * one everywhere.
 *
 * @param element The element whose properties to read.
 * @param name The property name.
 * @param fallback The value to use when the property is missing or is not a string.
 * @returns The string value, or `fallback` (`undefined` when none was given).
 */
export function stringProperty(element: SceneElement, name: string): string | undefined;
export function stringProperty(element: SceneElement, name: string, fallback: string): string;
export function stringProperty(element: SceneElement, name: string, fallback?: string): string | undefined {
    const value = element.properties[name];
    return typeof value === 'string' ? value : fallback;
}

/**
 * Reads a boolean configuration value off a Scene element.
 *
 * @param element The element whose properties to read.
 * @param name The property name.
 * @param fallback The value to use when the property is missing or is not a boolean.
 * @returns The boolean value, or `fallback` (`undefined` when none was given).
 */
export function booleanProperty(element: SceneElement, name: string): boolean | undefined;
export function booleanProperty(element: SceneElement, name: string, fallback: boolean): boolean;
export function booleanProperty(element: SceneElement, name: string, fallback?: boolean): boolean | undefined {
    const value = element.properties[name];
    return typeof value === 'boolean' ? value : fallback;
}

/**
 * Reads a numeric configuration value off a Scene element.
 *
 * `NaN` is rejected alongside non-numbers: it is a number by `typeof` but never a usable size, count or
 * bound, and letting it through would surface as an unexplained blank component rather than a fallback.
 *
 * @param element The element whose properties to read.
 * @param name The property name.
 * @param fallback The value to use when the property is missing or is not a usable number.
 * @returns The numeric value, or `fallback` (`undefined` when none was given).
 */
export function numberProperty(element: SceneElement, name: string): number | undefined;
export function numberProperty(element: SceneElement, name: string, fallback: number): number;
export function numberProperty(element: SceneElement, name: string, fallback?: number): number | undefined {
    const value = element.properties[name];
    return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

/**
 * Reads an array configuration value off a Scene element, as raw entries.
 *
 * Always returns an array - an absent or wrongly typed property becomes an empty one - because every
 * caller is about to map over it, and a component rendering nothing is a far better failure than one
 * throwing on `undefined.map`.
 *
 * @param element The element whose properties to read.
 * @param name The property name.
 * @returns The entries, or an empty array when the property is missing or is not an array.
 */
export function arrayProperty(element: SceneElement, name: string): unknown[] {
    const value = element.properties[name];
    return Array.isArray(value) ? value : [];
}

/**
 * Reads an array of strings off a Scene element, dropping any entry that is not one.
 *
 * @param element The element whose properties to read.
 * @param name The property name.
 * @returns The string entries, in order.
 */
export function stringArrayProperty(element: SceneElement, name: string): string[] {
    return arrayProperty(element, name).filter((entry): entry is string => typeof entry === 'string');
}

/**
 * Reads an array of objects off a Scene element, dropping any entry that is not one.
 *
 * This is the shape row data, column definitions and menu items all arrive in, so it is the common
 * bottom step every structured reader in this package builds on.
 *
 * @param element The element whose properties to read.
 * @param name The property name.
 * @returns The object entries, in order.
 */
export function recordArrayProperty(element: SceneElement, name: string): Record<string, unknown>[] {
    return arrayProperty(element, name).filter(
        (entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== undefined && entry !== null && !Array.isArray(entry)
    );
}

/**
 * Reads a selection component's options off a Scene element, normalizing both shapes a screen may use.
 *
 * A screen written by hand tends to say `options: ['Draft', 'Published']`; one generated from a model
 * says `options: [{ label: 'Draft', value: 'draft' }]`. Both are reasonable, so both are accepted and
 * flattened to {@link SelectOption} - an entry with only a label uses that label as its value, which is
 * exactly what the shorthand means.
 *
 * @param element The element whose properties to read.
 * @param name The property name.
 * @returns The normalized options, in order, skipping entries that carry no usable label.
 */
export function optionsProperty(element: SceneElement, name: string): SelectOption[] {
    const options: SelectOption[] = [];
    for (const entry of arrayProperty(element, name)) {
        if (typeof entry === 'string') {
            options.push({ label: entry, value: entry });
            continue;
        }

        if (typeof entry !== 'object' || entry === undefined || entry === null || Array.isArray(entry)) continue;

        const record = entry as Record<string, unknown>;
        const label = typeof record.label === 'string' ? record.label : undefined;
        const value = typeof record.value === 'string' ? record.value : label;
        if (label !== undefined && value !== undefined) options.push({ label, value });
    }

    return options;
}
