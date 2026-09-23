// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Dismisses the innermost dialog.
/// </summary>
public record CloseDialogAction : InteractionAction
{
    /// <inheritdoc/>
    public override InteractionActionKind Kind => InteractionActionKind.CloseDialog;
}
