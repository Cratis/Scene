// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, DiagnosticSeverity, type SceneDiagnostic } from '@cratis/scene.model';

// The diagnostics Scene reports about an icon: one that does not resolve, or one that could not be checked yet.
const iconCodes = new Set<string>([
    DiagnosticCode.MissingIconLibrary,
    DiagnosticCode.MissingIcon,
    DiagnosticCode.MissingIconVariant,
    DiagnosticCode.IncompatibleIconLibrary,
    DiagnosticCode.IconCatalogUnavailable,
    DiagnosticCode.IconNotVerified,
]);

export const isIconDiagnostic = (diagnostic: SceneDiagnostic): boolean => iconCodes.has(diagnostic.code);

// Not being able to verify an icon yet is a passing state, not something to put in front of the author.
const isPending = (diagnostic: SceneDiagnostic): boolean => diagnostic.code === DiagnosticCode.IconNotVerified;

// What Scene says about the icon in one property, worded as Scene worded it. Errors outrank warnings.
export function iconMessageOf(diagnostics: readonly SceneDiagnostic[], path: string, itemId?: string): string | undefined {
    const about = diagnostics.filter(diagnostic =>
        isIconDiagnostic(diagnostic) && !isPending(diagnostic) && diagnostic.path === path && diagnostic.itemId === itemId);
    return (about.find(diagnostic => diagnostic.severity === DiagnosticSeverity.Error) ?? about[0])?.message;
}

// The icon diagnostics a field shows next to itself, so the list at the top of the panel does not say them twice.
export const withoutIconDiagnostics = (diagnostics: readonly SceneDiagnostic[]): SceneDiagnostic[] =>
    diagnostics.filter(diagnostic => !isIconDiagnostic(diagnostic));

// The messages of the icons of a collection's items, by item, in the shape the ordered-item editor takes.
export function iconMessagesOfItems(diagnostics: readonly SceneDiagnostic[], path: string): Record<string, { icon: string }> {
    const messages: Record<string, { icon: string }> = {};
    for (const diagnostic of diagnostics) {
        if (diagnostic.itemId === undefined) continue;
        const message = iconMessageOf(diagnostics, path, diagnostic.itemId);
        if (message) messages[diagnostic.itemId] = { icon: message };
    }
    return messages;
}
