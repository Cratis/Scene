// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// An application's base navigational look - the shell its screens render inside. Mirrors Screenplay's
/// <c>layout</c> construct: a bare layout with plain slots is a special case of a layout whose slots all
/// use the default arrangement.
/// </summary>
/// <remarks>
/// A layout is application-level and there is one in force: it is what an application *selects*, usually
/// from a <see cref="Packages.PackageKind.Blueprint"/> package. What goes inside it - the shapes a module,
/// feature or slice brings - are <see cref="Screens.ScreenTemplate"/>s, and an application has many. The
/// two are structurally alike on purpose (both are slots plus an arrangement, evaluated by the same
/// engine); they differ in role, and a screen template additionally declares which slot it fits into.
/// </remarks>
/// <param name="Name">The layout's name.</param>
/// <param name="Slots">The slots the layout declares, in declaration order.</param>
/// <param name="Arrangement">
/// How the layout's own <paramref name="Slots"/> position relative to each other - a <see cref="FlowArrangement"/>
/// (leaves are <see cref="FlowSlotLeaf"/>) or <see cref="FreeformSlotArrangement"/>, or <see langword="null"/>
/// for the slots' declaration order with no further positioning information. Distinct from each
/// <see cref="Layouts.Slot"/>'s own <see cref="Slot.Arrangement"/>, which positions that one slot's filled
/// content instead of positioning the slots themselves.
/// </param>
public record Layout(string Name, IReadOnlyList<Slot> Slots, Arrangement? Arrangement = null);
