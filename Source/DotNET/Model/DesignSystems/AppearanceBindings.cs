// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.DesignSystems;

/// <summary>
/// Which token roles a profile's accent, corner style and font replace. A design system owns this because it alone knows
/// which of its tokens is the accent: Scene never assumes a token name.
/// </summary>
/// <param name="Accent">The color role the accent replaces (for example <c language="csharp">color.primary</c>), or <see langword="null"/> when the accent cannot be replaced.</param>
/// <param name="FocusRing">The shadow role derived from the accent as the keyboard focus indicator, or <see langword="null"/> for none.</param>
/// <param name="Corners">The radius role the corner style replaces, or <see langword="null"/> when corners cannot be replaced.</param>
/// <param name="Font">The font role the profile's font replaces, or <see langword="null"/> when the font cannot be replaced.</param>
public record AppearanceBindings(
    string? Accent = null,
    string? FocusRing = null,
    string? Corners = null,
    string? Font = null);
