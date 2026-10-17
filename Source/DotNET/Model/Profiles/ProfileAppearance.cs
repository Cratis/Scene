// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Profiles;

/// <summary>
/// How an application looks beyond the <see cref="UiProfile.Theme"/> it selects: the colour scheme, the accent colour, the corner style and the font.
/// </summary>
/// <param name="ColorScheme">Whether the application is light, dark or follows the system. <see langword="null"/> leaves the theme's own default.</param>
/// <param name="Accent">The accent colour as a CSS colour (for example <c language="csharp">#4f46e5</c>), or <see langword="null"/> to keep the theme's accent.</param>
/// <param name="Corners">How rounded corners are, or <see langword="null"/> to keep the theme's own corner radius.</param>
/// <param name="Font">The font, by the id of an entry in the font catalog (for example <c language="csharp">inter</c>), or <see langword="null"/> to keep the theme's own font.</param>
[method: JsonConstructor]
public record ProfileAppearance(
    ColorScheme? ColorScheme = null,
    string? Accent = null,
    CornerStyle? Corners = null,
    string? Font = null)
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ProfileAppearance"/> record with the members it had before the corners and the font.
    /// Kept so a package compiled against an earlier version still finds the constructor it was built with.
    /// </summary>
    /// <param name="colorScheme">The colour scheme.</param>
    /// <param name="accent">The accent colour.</param>
    public ProfileAppearance(ColorScheme? colorScheme, string? accent)
        : this(colorScheme, accent, null, null)
    {
    }
}
