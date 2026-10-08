// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A binding validation problem that preserves the authored model and tells a designer what to fix.
 */
export interface BindingDiagnostic {
    code: string;
    message: string;
    path?: string;
}
