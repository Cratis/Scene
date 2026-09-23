// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Surfaces a message.
/// </summary>
/// <param name="Level">How prominently to surface it.</param>
/// <param name="Message">The message.</param>
public record NotifyAction(NotificationLevel Level, InteractionMessage Message) : InteractionAction
{
    /// <inheritdoc/>
    public override InteractionActionKind Kind => InteractionActionKind.Notify;
}
