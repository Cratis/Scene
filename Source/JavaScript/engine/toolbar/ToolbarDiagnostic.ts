// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ToolbarDiagnosticCode } from './ToolbarDiagnosticCode';
import { ToolbarDiagnosticSeverity } from './ToolbarDiagnosticSeverity';

/**
 * One problem with a toolbar button.
 */
export interface ToolbarDiagnostic {
    /** What kind of problem this is. */
    code: ToolbarDiagnosticCode;

    /** Whether the button cannot work or is only incomplete. */
    severity: ToolbarDiagnosticSeverity;

    /** A sentence naming the button and the slice. */
    message: string;

    /** The id of the button the problem was found on. */
    button: string;
}
