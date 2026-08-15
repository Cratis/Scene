// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Profiles;
using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Starters;

namespace Cratis.Scene.Engine.Starters;

/// <summary>
/// Checks a <see cref="UiStarter"/>'s declared <see cref="UiStarter.Themes"/> against its own
/// <see cref="UiStarter.Packages"/> - part of Cratis/Scene#6. A starter is versioned per package
/// combination it targets, so a theme it ships as a choice that turns out incompatible with the starter's
/// own packages is exactly the gap <see cref="ThemeCompatibility"/> already surfaces for a
/// <see cref="UiProfile"/>; this reuses that rule rather than reimplementing it for starters.
/// </summary>
public static class StarterThemeValidation
{
    /// <summary>
    /// Finds the <see cref="UiStarter.Themes"/> that are not compatible with the starter's own
    /// <see cref="UiStarter.Packages"/>.
    /// </summary>
    /// <param name="starter">The <see cref="UiStarter"/> to check.</param>
    /// <param name="themes">Every known <see cref="Theme"/>, keyed by name.</param>
    /// <returns>The names in <see cref="UiStarter.Themes"/> that are either unknown to <paramref name="themes"/> or incompatible with <see cref="UiStarter.Packages"/>.</returns>
    public static IReadOnlyList<string> IncompatibleThemes(UiStarter starter, IReadOnlyDictionary<string, Theme> themes)
    {
        var profile = new UiProfile(starter.Name, string.Empty, starter.Packages);
        return starter.Themes
            .Where(name => !themes.TryGetValue(name, out var theme) || !ThemeCompatibility.IsCompatible(theme, profile))
            .ToList();
    }
}
