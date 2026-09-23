// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Represents one declarative effect inside a binding.
/// </summary>
/// <remarks>
/// The set is closed, and every operand is a reference to something the model declares rather than a string a
/// renderer interprets. That is what lets an action naming nothing be reported instead of becoming a control
/// that does nothing when clicked.
/// <para>
/// Continuations live on the base so that adding an action kind stays an append rather than a change to every
/// existing record.
/// </para>
/// </remarks>
[JsonPolymorphic]
[JsonDerivedType(typeof(ExecuteCommandAction))]
[JsonDerivedType(typeof(NavigateAction))]
[JsonDerivedType(typeof(NavigateBackAction))]
[JsonDerivedType(typeof(OpenDialogAction))]
[JsonDerivedType(typeof(CloseDialogAction))]
[JsonDerivedType(typeof(RefreshQueryAction))]
[JsonDerivedType(typeof(SetStateAction))]
[JsonDerivedType(typeof(NotifyAction))]
[JsonDerivedType(typeof(ConfirmAction))]
[JsonDerivedType(typeof(RaiseTriggerAction))]
public abstract record InteractionAction
{
    /// <summary>
    /// Gets which effect this action is.
    /// </summary>
    public abstract InteractionActionKind Kind { get; }

    /// <summary>
    /// Gets the arguments supplied to the action.
    /// </summary>
    public IReadOnlyList<InteractionArgument> Arguments { get; init; } = [];

    /// <summary>
    /// Gets the actions that run when this one succeeds.
    /// </summary>
    public IReadOnlyList<InteractionAction> OnSuccess { get; init; } = [];

    /// <summary>
    /// Gets the actions that run when this one fails.
    /// </summary>
    public IReadOnlyList<InteractionAction> OnFailure { get; init; } = [];

    /// <summary>
    /// Gets the actions that run with a dialog's result. Only <see cref="OpenDialogAction"/> carries these.
    /// </summary>
    public IReadOnlyList<InteractionAction> OnResult { get; init; } = [];
}
