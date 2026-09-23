// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Submits a modeled command.
/// </summary>
/// <param name="Command">The command to submit.</param>
public record ExecuteCommandAction(string Command) : InteractionAction;
