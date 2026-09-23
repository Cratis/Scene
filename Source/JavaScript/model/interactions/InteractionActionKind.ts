// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Which effect an {@link InteractionAction} is.
 *
 * An explicit discriminator rather than a structural one: NavigateBackAction and CloseDialogAction both carry no
 * operand, so nothing about their shape tells them apart. It also means a renderer meeting an action it does not
 * know can name it in a finding instead of reporting that something unidentifiable failed.
 *
 * Append only.
 */
export enum InteractionActionKind {
    ExecuteCommand = 'ExecuteCommand',
    Navigate = 'Navigate',
    NavigateBack = 'NavigateBack',
    OpenDialog = 'OpenDialog',
    CloseDialog = 'CloseDialog',
    RefreshQuery = 'RefreshQuery',
    SetState = 'SetState',
    Notify = 'Notify',
    Confirm = 'Confirm',
    RaiseTrigger = 'RaiseTrigger',
}
