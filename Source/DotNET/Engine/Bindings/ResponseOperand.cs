// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Bindings;

/// <summary>Identifies an action's destination for structural validation.</summary>
/// <param name="Kind">Either argument, stateValue or message.</param>
/// <param name="Name">The argument name, when the operand is an argument.</param>
public record ResponseOperand(string Kind, string? Name = null);
