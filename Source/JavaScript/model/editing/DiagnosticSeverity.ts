// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How serious a diagnostic is. An edit with an `Error` is refused; a `Warning` is reported and the edit goes
 * ahead.
 */
export enum DiagnosticSeverity {
    Error = 'error',
    Warning = 'warning',
}
