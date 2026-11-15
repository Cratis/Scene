// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Adds a slot to a template being authored.
/// </summary>
/// <param name="Template">The template.</param>
/// <param name="Slot">The slot.</param>
/// <param name="Index">Its position among the template's slots.</param>
public record AddSlotOperation(string Template, DesignSlot Slot, int? Index = null) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "addSlot";
}
