// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EnumerationResolution } from './EnumerationResolution';

/**
 * Resolves an authored value to a member of one of this package's string enums.
 *
 * Three forms are accepted, and the stored value is never rewritten:
 * - the canonical string value the enum declares (`'checkbox'`), which new documents use;
 * - the ordinal of the original .NET enum (`3`), which migrated documents carry. The ordinal is the member's
 *   position in declaration order, so that order is part of the stored-data contract and must not change;
 * - the .NET member name in its original Pascal case (`'Checkbox'`), which a JSON serialization of that enum
 *   produces.
 *
 * An absent value is the one default. Anything else - an out-of-range or fractional ordinal, a numeric
 * string, a differently cased name, `null` - resolves to a finding with a message, because the intended
 * behavior cannot be known and a silent fallback hides a mistyped document.
 *
 * @param property The property name, used in the message.
 * @param value The authored value.
 * @param members The enum object.
 * @param fallback The member an absent value means.
 * @returns The resolved member, or the finding.
 */
export function resolveEnumeration<TMember extends string>(
    property: string,
    value: unknown,
    members: Record<string, TMember>,
    fallback: TMember
): EnumerationResolution<TMember> {
    if (value === undefined) return { isValid: true, value: fallback };

    const canonical = Object.values(members);
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < canonical.length) {
        return { isValid: true, value: canonical[value] };
    }

    if (typeof value === 'string') {
        if (canonical.includes(value as TMember)) return { isValid: true, value: value as TMember };
        if (Object.hasOwn(members, value)) return { isValid: true, value: members[value] };
    }

    const shown = typeof value === 'string' ? `'${value}'` : JSON.stringify(value) ?? String(value);
    return {
        isValid: false,
        value,
        message: `Unsupported ${property} ${shown}. Use one of ${canonical.join(', ')}, or a legacy ordinal from 0 to ${canonical.length - 1}.`,
    };
}
