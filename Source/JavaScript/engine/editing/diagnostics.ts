// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, DiagnosticSeverity, SceneDiagnostic } from '@cratis/scene.model';

/**
 * The context a diagnostic can carry besides its code and message.
 */
export type DiagnosticContext = Partial<Omit<SceneDiagnostic, 'code' | 'severity' | 'message'>>;

/**
 * Builds an error diagnostic: the edit or resolution step that produced it did not happen.
 */
export function errorDiagnostic(code: DiagnosticCode, message: string, context: DiagnosticContext = {}): SceneDiagnostic {
    return { code, severity: DiagnosticSeverity.Error, message, ...context };
}

/**
 * Builds a warning diagnostic: the work went ahead, and the author should know something about it.
 */
export function warningDiagnostic(code: DiagnosticCode, message: string, context: DiagnosticContext = {}): SceneDiagnostic {
    return { code, severity: DiagnosticSeverity.Warning, message, ...context };
}

/**
 * Whether any diagnostic is an error.
 */
export function hasErrors(diagnostics: SceneDiagnostic[]): boolean {
    return diagnostics.some(diagnostic => diagnostic.severity === DiagnosticSeverity.Error);
}
