// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Writes screen state.
/// </summary>
/// <param name="Target">The declared state name being written.</param>
/// <param name="Value">The value to write.</param>
public record SetStateAction(string Target, BindingExpression Value) : InteractionAction
{
    /// <inheritdoc/>
    public override InteractionActionKind Kind => InteractionActionKind.SetState;
}
