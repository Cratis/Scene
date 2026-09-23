// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The built-in interaction kinds - what a user or a lifecycle did, rather than something the document declared.
 *
 * Append only: a renderer that does not know a member reports it rather than guessing, so members are never
 * renumbered or reordered.
 */
export enum InteractionTriggerKind {
    Click = 'Click',
    DoubleClick = 'DoubleClick',
    Select = 'Select',
    Submit = 'Submit',
    Change = 'Change',
    Load = 'Load',
    Unload = 'Unload',
    Enter = 'Enter',
    Leave = 'Leave',
}
