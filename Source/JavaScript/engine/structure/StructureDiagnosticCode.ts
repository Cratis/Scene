// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What is wrong with an application structure. The values are shared with the C# engine so both report
 * the same code for the same structure.
 */
export enum StructureDiagnosticCode {
    /** Two siblings share one id, so their qualified id does not identify a single node. */
    StructureDuplicateId = 'structureDuplicateId',

    /** Two siblings with different ids share one display name, so a picker or a name lookup cannot tell them apart. */
    StructureAmbiguousName = 'structureAmbiguousName',
}
