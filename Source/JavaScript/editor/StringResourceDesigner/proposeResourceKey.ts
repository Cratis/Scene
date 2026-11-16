// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Proposes a dotted `$strings` key for an "extract to resource" action - part of StudioIssues#159. Per the
 * issue's own scope update, the proposed key is prefixed with the declaring module/feature scope
 * (`invoices.actions.newInvoice` for text `"New Invoice"` under scope `['Invoicing', 'Actions']`), matching
 * the convention shown in `Documentation/screenplay/internationalization.md` (Screenplay repo). This only
 * proposes the key - it does not write it to a `.strings` file or rewrite the `.play` reference; both are
 * a file-I/O concern that belongs on the backend, alongside Screenplay's own `StringsFile.Parse`/`Write`.
 *
 * @param scope The declaring module/feature path, outermost first.
 * @param text The literal text being extracted.
 * @returns The proposed dotted key.
 */
export function proposeResourceKey(scope: readonly string[], text: string): string {
    const scopeKey = scope.map(toCamelSegment).filter(Boolean).join('.');
    const textKey = toCamelSegment(text);

    return scopeKey ? `${scopeKey}.${textKey}` : textKey;
}

function toCamelSegment(value: string): string {
    const words = value.split(/[^a-zA-Z0-9]+/).filter(Boolean);
    return words.map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word))).join('');
}

function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
