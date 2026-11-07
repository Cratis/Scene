// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// One slot of the current shell and where its content goes.
/// </summary>
/// <param name="Slot">The slot of the current shell.</param>
/// <param name="Action">What happens to its content.</param>
/// <param name="Screens">The screens that place content in the slot, in document order.</param>
/// <param name="Description">A sentence with the real names of the screens, slots and shells, ready to show.</param>
/// <param name="Target">The slot of the new shell the content lands in. <see langword="null"/> when it is dropped or not decided.</param>
/// <param name="Choices">For an <see cref="ShellSlotAction.Unresolved"/> slot: the choices on offer, move into the primary slot first, then each other slot, then drop.</param>
public record ShellSlotMove(
    string Slot,
    ShellSlotAction Action,
    IReadOnlyList<string> Screens,
    string Description,
    string? Target = null,
    IReadOnlyList<SlotRemap>? Choices = null);
