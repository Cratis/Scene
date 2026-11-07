// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How serious an {@link OutletDiagnostic} is.
 */
export enum OutletDiagnosticSeverity {
    /** The outlet cannot resolve as written; an item is left out or a reference names nothing. */
    Error = 'error',

    /** The outlet resolves, but something written has no effect or lands somewhere other than asked. */
    Warning = 'warning',
}
