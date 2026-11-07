// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SlotShapeDiagnosticCode } from './SlotShapeDiagnosticCode';

/** One problem with the slots of a stored Scene document. */
export interface SlotShapeDiagnostic {
    /** The engine-owned code. */
    code: SlotShapeDiagnosticCode;

    /** Where in the document the problem is, as a JSON path such as `$.layouts[0].slots[1]`. */
    path: string;

    /** The human message; it carries real names. */
    message: string;
}

/** The outcome of upgrading a stored Scene document from the outlet shape to the slot shape. */
export interface SlotShapeUpgrade {
    /** The document in the slot shape. Parts that could not be mapped are left as they were. */
    document: unknown;

    /** Whether the upgraded document differs from the one that came in. Always false for a document already in the slot shape. */
    changed: boolean;

    /** What could not be mapped. */
    diagnostics: SlotShapeDiagnostic[];
}
