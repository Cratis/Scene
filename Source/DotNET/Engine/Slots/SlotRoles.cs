// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Layouts;

namespace Cratis.Scene.Engine.Slots;

/// <summary>
/// Answers what a slot is: its role, and which slot of a layout or screen template is the primary one. The TypeScript twins
/// are <c language="csharp">resolveSlotRole</c> and <c language="csharp">primarySlotOf</c>.
/// </summary>
public static class SlotRoles
{
    /// <summary>
    /// The role a slot plays: the one it declares, or - when it declares none - <see cref="SlotRole.Page"/> for the primary
    /// slot and <see cref="SlotRole.Pane"/> for any other.
    /// </summary>
    /// <param name="slot">The slot.</param>
    /// <returns>The slot's role.</returns>
    public static SlotRole Resolve(Slot slot) => slot.Role ?? (slot.Primary == true ? SlotRole.Page : SlotRole.Pane);

    /// <summary>
    /// The name of the slot marked primary, or <see langword="null"/> when none is. With more than one marked (which
    /// validation reports), the first one wins.
    /// </summary>
    /// <param name="slots">The slots of one layout or screen template.</param>
    /// <returns>The primary slot's name.</returns>
    public static string? PrimaryOf(IEnumerable<Slot>? slots) => slots?.FirstOrDefault(slot => slot.Primary == true)?.Name;
}
