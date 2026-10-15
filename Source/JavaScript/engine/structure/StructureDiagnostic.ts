// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { StructureDiagnosticCode } from './StructureDiagnosticCode';

/**
 * One problem with an application structure.
 */
export interface StructureDiagnostic {
    /** What kind of problem this is. */
    code: StructureDiagnosticCode;

    /** A sentence naming the ids or names involved. */
    message: string;

    /** The qualified id of the node the problem was found on. */
    id: string;
}
