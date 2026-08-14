// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// A named template of slots that a <see cref="Screens.Screen"/> fills with content. Mirrors Screenplay's
/// <c>layout</c> construct: a bare layout with plain slots is a special case of a layout whose slots all
/// use the default arrangement.
/// </summary>
/// <param name="Name">The layout's name.</param>
/// <param name="Slots">The slots the layout declares, in declaration order.</param>
public record Layout(string Name, IReadOnlyList<Slot> Slots);
