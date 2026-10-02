// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconReference } from './IconReference';

/**
 * The character that separates the parts of an icon reference's text form. A reference's parts therefore
 * cannot contain it - an npm package name, an icon key and a variant name never do.
 */
const separator = '#';

function isPart(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0 && !value.includes(separator);
}

/**
 * Whether a value is a well-formed {@link IconReference}: a library and a key that are non-empty, an
 * optional non-empty variant, none of them containing the text-form separator. Extra properties are
 * tolerated, because a reference read from a persisted document may carry editor-added metadata.
 */
export function isIconReference(value: unknown): value is IconReference {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as Record<string, unknown>;
    return isPart(candidate.library) && isPart(candidate.key) && (candidate.variant === undefined || isPart(candidate.variant));
}

/**
 * Whether two references name the same icon. Equality is all three fields - library, key and variant -
 * and nothing else; an absent variant equals only another absent variant.
 */
export function iconReferencesEqual(left: IconReference, right: IconReference): boolean {
    return left.library === right.library && left.key === right.key && (left.variant ?? undefined) === (right.variant ?? undefined);
}

/**
 * The canonical single-string form of a reference, for keys, logs and diagnostics:
 * `library#key`, or `library#key#variant`. Two references are equal exactly when their text forms are equal.
 * It is a convenience for people and tools, not the persisted shape - persist the {@link IconReference}.
 *
 * @throws Error when a part is empty or contains `#`.
 */
export function formatIconReference(reference: IconReference): string {
    if (!isIconReference(reference)) {
        throw new Error(`'${JSON.stringify(reference)}' is not a valid icon reference: library and key are required, and no part may be empty or contain '${separator}'`);
    }

    return reference.variant === undefined
        ? `${reference.library}${separator}${reference.key}`
        : `${reference.library}${separator}${reference.key}${separator}${reference.variant}`;
}

/**
 * Reads the text form produced by {@link formatIconReference}. Returns `undefined` for anything that is
 * not one - including a bare legacy icon name such as `pi pi-home`, which has no library and so cannot be
 * made into a reference without choosing one.
 */
export function parseIconReference(text: string): IconReference | undefined {
    const parts = text.split(separator);
    if (parts.length < 2 || parts.length > 3 || !parts.every(isPart)) return undefined;
    const [library, key, variant] = parts;
    return variant === undefined ? { library, key } : { library, key, variant };
}
