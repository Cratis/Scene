// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Profiles;

/// <summary>
/// How an application looks beyond the <see cref="UiProfile.Theme"/> it selects: the colour scheme and the accent colour.
/// </summary>
/// <param name="ColorScheme">Whether the application is light, dark or follows the system. <see langword="null"/> leaves the theme's own default.</param>
/// <param name="Accent">The accent colour as a CSS colour (for example <c language="csharp">#4f46e5</c>), or <see langword="null"/> to keep the theme's accent.</param>
public record ProfileAppearance(
    ColorScheme? ColorScheme = null,
    string? Accent = null);
