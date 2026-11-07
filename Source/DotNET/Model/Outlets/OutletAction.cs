// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// What a button and a menu entry share: a title and what happens when it is chosen. An action runs exactly one of a
/// slice (a hook), a navigation target or a built-in.
/// </summary>
public abstract record OutletAction : OutletItem
{
    /// <summary>Gets the text shown.</summary>
    public required string Title { get; init; }

    /// <summary>Gets the qualified icon reference, when the action has one.</summary>
    public string? Icon { get; init; }

    /// <summary>Gets the qualified id of the State Change slice the action runs, for example <c language="screenplay">catalog.products.SetProductPrice</c>.</summary>
    public string? Slice { get; init; }

    /// <summary>Gets the command a hand-authored action names instead of a slice; the engine turns it into the one slice that accepts the command.</summary>
    public string? Command { get; init; }

    /// <summary>Gets where the action navigates to, when it navigates instead of running a slice.</summary>
    public DestinationReference? NavigateTo { get; init; }

    /// <summary>Gets the built-in the action runs instead of a slice or a navigation target.</summary>
    public OutletBuiltInAction? Runs { get; init; }

    /// <summary>Gets where the slice's screen opens; automatic when absent.</summary>
    public Opens? Opens { get; init; }

    /// <summary>Gets the slot the slice's screen opens in, when <see cref="Opens"/> is a slot.</summary>
    public string? OpensIn { get; init; }

    /// <summary>Gets what the action acts on; the outlet's subject when absent.</summary>
    public OutletSubject? Subject { get; init; }

    /// <summary>Gets the condition under which the action is enabled, such as <c language="screenplay">item.status == "onSale"</c>.</summary>
    public string? EnabledWhen { get; init; }

    /// <summary>Gets the question asked before the action runs, when it asks one.</summary>
    public string? Confirm { get; init; }

    /// <summary>Gets the policy a user must satisfy to see the action.</summary>
    public string? Authorize { get; init; }
}
