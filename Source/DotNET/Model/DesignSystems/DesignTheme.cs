// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.DesignSystems;

/// <summary>
/// A theme of a design system: an implementation that gives every token a value, in every mode.
/// </summary>
/// <param name="Name">The theme's name.</param>
/// <param name="Modes">The theme's values, one entry per mode of the design system.</param>
/// <param name="IsDefault">Whether this is the theme an application draws when its profile names none.</param>
/// <param name="Description">A one-line description for a theme picker, or <see langword="null"/>.</param>
public record DesignTheme(
    string Name,
    IReadOnlyList<DesignThemeMode> Modes,
    bool IsDefault = false,
    string? Description = null);
