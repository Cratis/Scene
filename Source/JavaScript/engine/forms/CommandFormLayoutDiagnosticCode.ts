// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Diagnostic codes for command-form geometry validation.
 */
export enum CommandFormLayoutDiagnosticCode {
    EmptyColumns = 'emptyColumns',
    DuplicateColumn = 'duplicateColumn',
    InvalidColumnIndex = 'invalidColumnIndex',
    InvalidWidth = 'invalidWidth',
    DuplicatePlacement = 'duplicatePlacement',
    InvalidPlacement = 'invalidPlacement',
    MissingField = 'missingField',
    OutOfBoundsPlacement = 'outOfBoundsPlacement',
}
