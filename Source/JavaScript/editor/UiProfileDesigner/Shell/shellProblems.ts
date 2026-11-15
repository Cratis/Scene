// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ShellDiagnosticCode, type EffectiveShell } from '@cratis/scene.engine';
import type { ProfileProblem } from '../Problems/ProfileProblem';
import { ProfileNodeKind } from '../Structure/ProfileNodeKind';

// The codes that mean the shell cannot be the application's shell at all; the others say something is worth knowing.
const blocking = new Set<ShellDiagnosticCode>([
    ShellDiagnosticCode.RootTemplateUnknown,
    ShellDiagnosticCode.RootTemplateVersionNotSatisfied,
    ShellDiagnosticCode.RootTemplateNotApplicable,
    ShellDiagnosticCode.RootTemplateMissingContentSlot,
    ShellDiagnosticCode.RootTemplateCycle,
]);

/**
 * What Scene found wrong with the shell, as problems of the Shell node: the engine's own codes and messages, which name the shell, the blueprint and the
 * screens instead of identifiers. Nothing is decided here; the shell is `resolveEffectiveShell`'s answer.
 *
 * @param shell The shell in place.
 * @returns A problem per diagnostic, blocking ones as errors.
 */
export function shellProblemsOf(shell: EffectiveShell): ProfileProblem[] {
    return shell.diagnostics.map(diagnostic => ({
        code: diagnostic.code,
        severity: blocking.has(diagnostic.code) ? 'error' as const : 'warning' as const,
        message: diagnostic.message,
        node: ProfileNodeKind.Shell,
    }));
}
