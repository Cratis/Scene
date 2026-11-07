// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletDiagnosticCode } from './OutletDiagnosticCode';
import { OutletDiagnosticSeverity } from './OutletDiagnosticSeverity';

/**
 * One problem with the outlets of a chain of levels.
 */
export interface OutletDiagnostic {
    /** The engine-owned code. */
    code: OutletDiagnosticCode;

    /** How serious it is. */
    severity: OutletDiagnosticSeverity;

    /** The name of the outlet. */
    outlet: string;

    /** The name of the level the problem is written at; absent when no level is to blame. */
    owner?: string;

    /** The id of the item concerned, when one is. */
    item?: string;

    /** The human message; it carries real names. */
    message: string;
}
