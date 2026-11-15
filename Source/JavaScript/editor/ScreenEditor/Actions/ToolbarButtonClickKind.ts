// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// What pressing a toolbar button does.
export enum ToolbarButtonClickKind {
    None = 'none',

    // Opens a screen of the application.
    Navigate = 'navigate',

    // Opens one of the document's dialog templates.
    OpenDialog = 'openDialog',

    // Submits a State Change slice's command.
    ExecuteCommand = 'executeCommand',
}
