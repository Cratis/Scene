// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Represents the text an action shows: a literal, a localization key, or a binding resolved at the moment the
/// action runs.
/// </summary>
/// <param name="Text">The literal text, when the message is one.</param>
/// <param name="StringsKey">The localization key, when the message is one.</param>
/// <param name="Binding">The binding to resolve, when the message is one.</param>
/// <remarks>
/// Exactly one is set. Kept as three explicit members rather than one string a consumer has to sniff, because
/// 'does this start with $strings.' is the kind of rule that ends up implemented differently in every renderer.
/// </remarks>
public record InteractionMessage(
    string? Text = null,
    string? StringsKey = null,
    BindingExpression? Binding = null);
