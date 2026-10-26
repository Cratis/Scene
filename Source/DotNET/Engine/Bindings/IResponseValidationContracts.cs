// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Interactions;

namespace Cratis.Scene.Engine.Bindings;

/// <summary>Supplies semantic types without persisting a command catalog in Scene.</summary>
public interface IResponseValidationContracts
{
    /// <summary>Looks up a command's response contract.</summary>
    /// <param name="command">The resolved command name.</param>
    /// <returns>The response contract, or null when metadata is unknown.</returns>
    ResponseContract? CommandResponse(string command);

    /// <summary>Looks up the actual destination type of a binding-bearing operand.</summary>
    /// <param name="action">The action owning the destination.</param>
    /// <param name="operand">The destination to inspect.</param>
    /// <returns>The destination type, or null when metadata is unknown.</returns>
    ResponseValueType? TargetType(InteractionAction action, ResponseOperand operand);
}
