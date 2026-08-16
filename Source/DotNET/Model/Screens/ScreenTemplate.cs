// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Layouts;

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// A reusable screen structure that fills a named slot on whatever contains it, and offers slots of its
/// own for what it contains in turn.
/// </summary>
/// <remarks>
/// <para>
/// A <see cref="Layout"/> and a screen template are deliberately different things. A layout is the
/// application's base navigational look - the shell with its top bar, navigation and content region -
/// and an application has one. A screen template is what goes *inside* that shell, and an application has
/// many: one per module, feature or slice that needs a shape of its own.
/// </para>
/// <para>
/// <see cref="FitsSlot"/> is what makes them compose. A module's screen template fits the application
/// layout's content slot; a feature's screen template fits a slot the module's template declares; a
/// slice's fits one the feature's declares. The same rule at every level, so nesting is arbitrarily deep
/// without a second mechanism - and a template always states where it belongs rather than being told by
/// whatever happens to host it.
/// </para>
/// </remarks>
/// <param name="Name">The template's name, which a <see cref="Screen"/> refers to.</param>
/// <param name="FitsSlot">
/// The name of the slot on the containing <see cref="Layout"/> or screen template this one fills, or
/// <see langword="null"/> for a template that is placed explicitly rather than by declaration.
/// </param>
/// <param name="Slots">The slots this template offers to whatever it contains, in declaration order.</param>
/// <param name="Arrangement">
/// How this template's own <paramref name="Slots"/> position relative to each other - a
/// <see cref="FlowArrangement"/> (leaves are <see cref="FlowSlotLeaf"/>) or a
/// <see cref="FreeformSlotArrangement"/>, or <see langword="null"/> for declaration order with no further
/// positioning. The same shape a <see cref="Layout"/> uses, evaluated by the same engine.
/// </param>
/// <param name="Content">
/// Content the template itself provides, keyed by slot name - the chrome a template brings with it, as
/// opposed to what a <see cref="Screen"/> based on it fills in. Empty for a template that is purely
/// structural.
/// </param>
/// <param name="DisplayName">A human-readable name for a template picker, falling back to <paramref name="Name"/>.</param>
/// <param name="Description">A one-line description for a template picker.</param>
public record ScreenTemplate(
    string Name,
    string? FitsSlot,
    IReadOnlyList<Slot> Slots,
    Arrangement? Arrangement = null,
    IReadOnlyDictionary<string, IReadOnlyList<SceneElement>>? Content = null,
    string? DisplayName = null,
    string? Description = null);
