// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Removes a slot, and what is in it, from a template being authored.
/// </summary>
/// <param name="Template">The template.</param>
/// <param name="Slot">The slot's name.</param>
public record RemoveSlotOperation(string Template, string Slot) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "removeSlot";
}
