// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Represents a bundle of interaction trigger to action bindings, attached to something that can be
/// interacted with.
/// </summary>
/// <param name="Name">The behavior's name, or <see langword="null"/> when it was written inline on what it is attached to.</param>
/// <param name="Bindings">The trigger to action bindings.</param>
/// <param name="Order">Where this behavior runs among the others attached to the same thing, when it says.</param>
/// <remarks>
/// A named behavior and an inline one are the same shape - anonymity is a property rather than a separate kind
/// of node - so the engine has one resolution path and a renderer has one thing to subscribe to.
/// <para>
/// Attachments are additive: a behavior on a template and a behavior on an element both run, outermost first,
/// unless <paramref name="Order"/> says otherwise.
/// </para>
/// </remarks>
public record Behavior(
    string? Name,
    IReadOnlyList<InteractionBinding> Bindings,
    int? Order = null);
