// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyChoice } from '@cratis/scene.model';

/**
 * The choices for an enumeration property: the stable values new documents use, then the ordinals migrated
 * documents carry.
 *
 * A migrated control stores the original numeric value. Offering those ordinals keeps the stored value valid
 * against the descriptor (so an inspector shows it as the current choice) without rewriting it behind the
 * author's back. The position of a member in `members` is its ordinal.
 *
 * @param members The enum object.
 * @param labels The label of each member, by canonical value.
 * @returns The canonical choices followed by one legacy choice per ordinal.
 */
export function legacyEnumerationChoices<TMember extends string>(members: Record<string, TMember>, labels: Record<TMember, string>): PropertyChoice[] {
    const canonical = Object.values(members);
    return [
        ...canonical.map(member => ({ value: member, label: labels[member] })),
        ...canonical.map((member, ordinal) => ({
            value: ordinal,
            label: `${labels[member]} (legacy ${ordinal})`,
            description: `The ordinal ${ordinal} of the original enum, as stored by migrated documents.`,
        })),
    ];
}
