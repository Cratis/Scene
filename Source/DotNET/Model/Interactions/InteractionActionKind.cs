// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Defines which effect an <see cref="InteractionAction"/> is.
/// </summary>
/// <remarks>
/// An explicit discriminator rather than a structural one: <see cref="NavigateBackAction"/> and
/// <see cref="CloseDialogAction"/> both carry no operand, so nothing about their shape distinguishes them. It
/// also means a renderer meeting an action it does not know can name it in a finding instead of reporting that
/// something unidentifiable failed.
/// <para>Append only.</para>
/// </remarks>
public enum InteractionActionKind
{
    /// <summary>Submit a modeled command.</summary>
    ExecuteCommand = 0,

    /// <summary>Change the active screen.</summary>
    Navigate = 1,

    /// <summary>Pop navigation history.</summary>
    NavigateBack = 2,

    /// <summary>Open a dialog over the application.</summary>
    OpenDialog = 3,

    /// <summary>Dismiss the innermost dialog.</summary>
    CloseDialog = 4,

    /// <summary>Re-run a query.</summary>
    RefreshQuery = 5,

    /// <summary>Write screen state.</summary>
    SetState = 6,

    /// <summary>Surface a message.</summary>
    Notify = 7,

    /// <summary>Gate the actions that follow on the user agreeing.</summary>
    Confirm = 8,

    /// <summary>Fire a declared application trigger.</summary>
    RaiseTrigger = 9
}
