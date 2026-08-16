// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Narrow readers for an {@link ExternalComponent}'s `properties` bag.
 *
 * The bag is `Record<string, unknown>` because it survives a round trip through JSON - a `.play` screen
 * is authored as text, compiled by Stage, and re-read by Studio, and none of those steps carry a
 * TypeScript type with it. An adapter therefore has to narrow every value it reads, and the tempting
 * shortcut (`element.properties.title as string`) is a lie the compiler will happily believe: a screen
 * that writes `title: 42` then reaches the wrapped component as a number and fails somewhere far away.
 *
 * These helpers all answer the same way - the value when it really is of the asked-for type, `undefined`
 * otherwise - so an adapter reads a property and applies its own default in one expression, and a
 * mistyped property degrades to the default instead of corrupting the render.
 */

/**
 * Reads a string property, or `undefined` when it is absent or not a string.
 */
export function stringProperty(properties: Record<string, unknown>, name: string): string | undefined {
    const value = properties[name];
    return typeof value === 'string' ? value : undefined;
}

/**
 * Reads a boolean property, or `undefined` when it is absent or not a boolean.
 *
 * Deliberately not truthiness: a screen that sets `showTitle: 0` means something different from one that
 * leaves it out, and only the second should fall back to the adapter's default.
 */
export function booleanProperty(properties: Record<string, unknown>, name: string): boolean | undefined {
    const value = properties[name];
    return typeof value === 'boolean' ? value : undefined;
}

/**
 * Reads a numeric property, or `undefined` when it is absent, not a number, or `NaN`.
 *
 * `NaN` is excluded because it is the one number that makes every downstream comparison silently false -
 * a slider with `min: NaN` renders without complaint and behaves as if it had no minimum at all.
 */
export function numberProperty(properties: Record<string, unknown>, name: string): number | undefined {
    const value = properties[name];
    return typeof value === 'number' && !Number.isNaN(value) ? value : undefined;
}

/**
 * Reads an array property, or `undefined` when it is absent or not an array.
 *
 * The element type is deliberately left as `unknown` - narrowing the elements is the caller's job,
 * through {@link stringArrayProperty} or its own mapping - so this helper never has to guess what a
 * heterogeneous list was supposed to be.
 */
export function arrayProperty(properties: Record<string, unknown>, name: string): unknown[] | undefined {
    const value = properties[name];
    return Array.isArray(value) ? value : undefined;
}

/**
 * Reads an array property and keeps only its string elements, or `undefined` when the property is absent
 * or not an array.
 *
 * Non-string elements are dropped rather than rejecting the whole list, because these lists are
 * column names, filter fields and the like: one bad entry should cost that one entry, not the entire
 * table's filtering.
 */
export function stringArrayProperty(properties: Record<string, unknown>, name: string): string[] | undefined {
    return arrayProperty(properties, name)?.filter((value): value is string => typeof value === 'string');
}

/**
 * Reads an object property as a plain record, or `undefined` when it is absent, `null`, or an array.
 *
 * Arrays are excluded even though `typeof [] === 'object'`, because every caller here wants a keyed
 * object - a JSON schema, a document being edited - and an array reaching one of those would be a
 * different bug entirely.
 */
export function objectProperty(properties: Record<string, unknown>, name: string): Record<string, unknown> | undefined {
    const value = properties[name];
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

/**
 * Reads an array property and keeps only its plain-object elements, or `undefined` when the property is
 * absent or not an array.
 *
 * This is what an authored `options` list arrives as - `[{ label: 'Draft', value: 'draft' }, ...]` - and
 * the same forgiving rule as {@link stringArrayProperty} applies: one malformed entry costs that entry,
 * not the whole dropdown.
 */
export function objectArrayProperty(properties: Record<string, unknown>, name: string): Record<string, unknown>[] | undefined {
    return arrayProperty(properties, name)?.filter(
        (value): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
    );
}

/**
 * Reads a string property that has to be one of a fixed set of values, or `undefined` when it is absent
 * or outside the set.
 *
 * Several of the wrapped `@cratis/components` props are string literal unions (`'horizontal' | 'vertical'`,
 * `'top' | 'right' | 'bottom' | 'left'`). This is what turns an arbitrary authored string into one of
 * them without an assertion: an unrecognized value falls back to the component's own default rather than
 * being forced through as a value the component never expects to see.
 *
 * @param allowed The permitted values, most usefully written as a `const` tuple so `T` infers as the union.
 */
export function unionProperty<T extends string>(properties: Record<string, unknown>, name: string, allowed: readonly T[]): T | undefined {
    const value = stringProperty(properties, name);
    return value !== undefined && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}
