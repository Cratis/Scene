// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// What the user chose to do with the content of a slot the new shell does not have.
/// </summary>
/// <param name="Action"><see cref="ShellSlotAction.MoveToPrimary"/>, <see cref="ShellSlotAction.MapTo"/> or <see cref="ShellSlotAction.Drop"/>.</param>
/// <param name="Target">For <see cref="ShellSlotAction.MapTo"/>: the slot of the new shell to move the content into.</param>
public record SlotRemap(ShellSlotAction Action, string? Target = null);
