// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Reads an Arc binding name as a sentence: `AllInvoices` becomes `All invoices`.
 *
 * Arc proxy names are the C# artifact names - a `[ReadModel]`'s static query method, a `[Command]` record -
 * so they arrive in PascalCase and describe exactly what the page is about. Using them as the fallback
 * heading means a page template is legible before anyone has written a title, and the heading a designer
 * sees at design time is the one the backend actually named.
 *
 * Only the boundary between a lowercase or numeric character and an uppercase one is treated as a word
 * break, so a run of capitals stays together: `AllPIIRecords` reads as `All PIIRecords` rather than being
 * chopped into initials. That is the right trade - a wrong word break in an acronym is much more jarring
 * than a missing one. For the same reason a word is only lowered when it looks like an ordinary
 * capitalized word, so an acronym keeps its shape instead of being flattened into `piirecords`.
 *
 * @param name The binding name as a screen wrote it.
 * @returns The name as a sentence, with only the first word capitalized.
 */
export function humanizeBindingName(name: string): string {
    const words = name
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .split(/\s+/)
        .filter(word => word.length > 0);

    if (words.length === 0) {
        return name;
    }

    return [words[0], ...words.slice(1).map(lowered)].join(' ');
}

function lowered(word: string): string {
    return /^[A-Z][a-z]/.test(word) ? `${word[0].toLowerCase()}${word.slice(1)}` : word;
}
