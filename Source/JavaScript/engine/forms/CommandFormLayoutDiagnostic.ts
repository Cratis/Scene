// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayoutDiagnosticCode } from './CommandFormLayoutDiagnosticCode';

/**
 * A validation problem in authored command-form geometry.
 */
export interface CommandFormLayoutDiagnostic {
    code: CommandFormLayoutDiagnosticCode;
    message: string;
    path: string;
}
