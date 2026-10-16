// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// What one screen relies on, which a profile change must still supply. The host reads it from its documents.
/// </summary>
/// <param name="Screen">The screen's name, shown in the message.</param>
/// <param name="Layouts">The layouts it uses.</param>
/// <param name="ScreenTemplates">The screen templates it uses.</param>
/// <param name="DialogTemplates">The dialog templates it uses.</param>
/// <param name="Slots">The slots it fills, by the layout or template that owns them.</param>
public record ProfileUsage(
    string Screen,
    IReadOnlyList<string> Layouts,
    IReadOnlyList<string> ScreenTemplates,
    IReadOnlyList<string> DialogTemplates,
    IReadOnlyList<SlotUsage> Slots);
