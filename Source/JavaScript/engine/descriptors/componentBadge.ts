// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor } from '@cratis/scene.model';

const vowels = 'aeiou';

/**
 * The two-letter badge a component picker draws for a component that has no icon to show.
 *
 * An explicit `badge` wins (trimmed to two letters). Otherwise a name of several words (`Card grid`, `Stat card`) takes the
 * initials of its first two words (`Cg`, `Sc`); a single word takes its first letter and the first consonant after it
 * (`Button` -> `Bt`, `List` -> `Ls`), or its second letter when it has none. A camel-cased name is read as words
 * (`dataTable` -> `Data table`). The first letter is upper case, the second lower case.
 */
export function componentBadge(descriptor: Pick<ComponentDescriptor, 'component' | 'displayName' | 'badge'>): string {
    const explicit = descriptor.badge?.trim();
    if (explicit) return capitalize(explicit.slice(0, 2));

    const name = descriptor.displayName?.trim() || bareName(descriptor.component);
    const words = name
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .split(/[^A-Za-z0-9]+/)
        .filter(word => word.length > 0);

    if (words.length === 0) return '??';
    if (words.length > 1) return capitalize(words[0][0] + words[1][0]);

    const word = words[0];
    if (word.length === 1) return word.toUpperCase();
    const consonant = [...word.slice(1)].find(letter => /[a-z]/i.test(letter) && !vowels.includes(letter.toLowerCase()));
    return capitalize(word[0] + (consonant ?? word[1]));
}

function bareName(component: string): string {
    return component.slice(component.lastIndexOf(':') + 1);
}

function capitalize(letters: string): string {
    return letters.charAt(0).toUpperCase() + letters.slice(1).toLowerCase();
}
