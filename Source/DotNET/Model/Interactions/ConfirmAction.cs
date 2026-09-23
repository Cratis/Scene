// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Gates the actions that follow on the user agreeing.
/// </summary>
/// <param name="Message">What to ask.</param>
public record ConfirmAction(InteractionMessage Message) : InteractionAction;
