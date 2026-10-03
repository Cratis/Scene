// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Whether an entry is a serialized legacy UI element - an object that names its type in `_derivedTypeId`.
 *
 * The original `ItemsControl.Items` and `TreeTable.Columns` held UI elements, not data. Scene does not
 * read those shapes and has no runtime adapter for them: the controls recognize them only to refuse them
 * visibly, instead of listing the element's fields as if they were rows. Converting them is the migration
 * tool's job, which maps each element to a canonical slot (see the package documentation).
 *
 * @param entry An entry of `items` or `columns`.
 */
export function isSerializedLegacyElement(entry: unknown): boolean {
    return typeof entry === 'object' && entry !== null && !Array.isArray(entry) && typeof (entry as { _derivedTypeId?: unknown })._derivedTypeId === 'string';
}

/**
 * The message for entries that were refused, or `undefined` when there were none.
 *
 * @param entries The authored entries.
 * @param property The property they came from.
 * @param guidance What the author should do instead, finishing the sentence "Author them ..." or similar.
 */
export function legacyElementMessage(entries: unknown[], property: string, guidance: string): string | undefined {
    const refused = entries.filter(isSerializedLegacyElement).length;
    return refused === 0
        ? undefined
        : `${refused} entr${refused === 1 ? 'y' : 'ies'} of ${property} ${refused === 1 ? 'is a' : 'are'} serialized legacy UI element${refused === 1 ? '' : 's'}, which this control does not read. ${guidance}`;
}
