// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Represents one argument passed to an action.
/// </summary>
/// <param name="Name">The argument name on the target.</param>
/// <param name="Value">Where the value comes from.</param>
public record InteractionArgument(string Name, BindingExpression Value);
