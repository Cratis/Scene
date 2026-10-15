// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** A person shown as an avatar. */
export interface AvatarPerson {
    name: string;
    imageUrl?: string;
}

/** Reads people out of a property value, dropping entries without a name. */
export function readPeople(value: unknown): AvatarPerson[] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((entry): AvatarPerson[] => {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [];
        const { name, imageUrl } = entry as Record<string, unknown>;
        if (typeof name !== 'string' || name.trim().length === 0) return [];
        return [{ name: name.trim(), ...(typeof imageUrl === 'string' && imageUrl.length > 0 ? { imageUrl } : {}) }];
    });
}

/** The initials of a name: the first letter of the first and last words, so "Ada King Lovelace" is AL and "Ada" is A. */
export function initialsOf(name: string): string {
    const words = name.split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return '';

    const first = Array.from(words[0])[0] ?? '';
    const last = words.length > 1 ? Array.from(words[words.length - 1])[0] ?? '' : '';
    return `${first}${last}`.toLocaleUpperCase();
}

/** Splits people into those shown and how many are folded into the "+N" chip; at least one is always shown when there are any. */
export function visiblePeople(people: AvatarPerson[], maximum: number): { shown: AvatarPerson[]; hidden: number } {
    const limit = Math.max(1, Math.floor(maximum));
    return people.length <= limit ? { shown: people, hidden: 0 } : { shown: people.slice(0, limit), hidden: people.length - limit };
}
