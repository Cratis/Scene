// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What is wrong with a toolbar button. The values are shared with the C# engine so both report the same code for
 * the same toolbar.
 */
export enum ToolbarDiagnosticCode {
    /** A button invokes a slice the application structure does not have. */
    ToolbarButtonSliceNotFound = 'toolbarButtonSliceNotFound',

    /** A button invokes a slice that is not a state change; state views and automations never take user input. */
    ToolbarButtonSliceNotStateChange = 'toolbarButtonSliceNotStateChange',

    /** A button has no slice yet. It is allowed while designing, and flagged. */
    ToolbarButtonSliceEmpty = 'toolbarButtonSliceEmpty',
}
