// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text.RegularExpressions;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Describes the theme cards and switches the colour scheme. The TypeScript twin is <c language="csharp">describeThemeCards</c>.
/// </summary>
public static partial class ThemeCards
{
    const string DefaultLight = "Scene Default Light";
    const string DefaultDark = "Scene Default Dark";

    /// <summary>
    /// Describes the theme cards: each theme's scheme, accent and corners, whether choosing it needs a package the profile does not list (and which),
    /// and which one is selected. Themes are filtered by the colour scheme when one is given.
    /// </summary>
    /// <param name="profile">The profile.</param>
    /// <param name="themes">Every theme that could be chosen, in the order to offer them.</param>
    /// <param name="catalog">Every package that could be selected; a theme belongs to the package that lists it.</param>
    /// <param name="scheme">The colour scheme to show themes of; every theme when <see langword="null"/>.</param>
    /// <returns>The cards.</returns>
    public static IReadOnlyList<ThemeCard> Describe(UiProfile profile, IReadOnlyList<Theme> themes, IReadOnlyList<ScenePackage> catalog, ColorScheme? scheme = null) =>
    [
        .. themes
            .Where(theme => scheme is null || (theme.IsDark ? ColorScheme.Dark : ColorScheme.Light) == scheme)
            .Select(theme =>
            {
                var suppliers = catalog.Where(candidate => candidate.Themes.Contains(theme.Name)).ToList();
                var missing = suppliers.Count > 0 && !suppliers.Exists(supplier => profile.Packages.Contains(supplier.Name)) ? suppliers[0] : null;
                string? accent = null;
                string? radius = null;
                theme.Tokens?.TryGetValue("primary.color", out accent);
                theme.Tokens?.TryGetValue("content.borderRadius", out radius);
                return new ThemeCard(
                    theme.Name,
                    theme.IsDark ? "dark" : "light",
                    accent,
                    CornersOf(radius),
                    theme.Description,
                    profile.Theme == theme.Name,
                    missing is null,
                    missing?.Name,
                    missing is null ? null : $"Needs {missing.DisplayName ?? missing.Name}. Selecting it adds the package.");
            })
    ];

    /// <summary>
    /// Switches the colour scheme. When the selected theme belongs to the other scheme, the theme moves to the matching Scene Default theme.
    /// </summary>
    /// <param name="profile">The profile.</param>
    /// <param name="scheme">The scheme to switch to; <see cref="ColorScheme.Light"/> or <see cref="ColorScheme.Dark"/>.</param>
    /// <param name="themes">Every theme that could be chosen.</param>
    /// <returns>The profile after the switch.</returns>
    public static ColorSchemeEdit SwitchColorScheme(UiProfile profile, ColorScheme scheme, IReadOnlyList<Theme> themes)
    {
        var switched = profile with { Appearance = (profile.Appearance ?? new ProfileAppearance()) with { ColorScheme = scheme } };
        var current = themes.FirstOrDefault(theme => theme.Name == profile.Theme);
        if (current is null || (current.IsDark ? ColorScheme.Dark : ColorScheme.Light) == scheme)
        {
            return new ColorSchemeEdit(switched, false, string.Empty);
        }

        var target = scheme == ColorScheme.Dark ? DefaultDark : DefaultLight;
        if (!themes.Any(theme => theme.Name == target))
        {
            return new ColorSchemeEdit(switched, false, string.Empty);
        }

        return new ColorSchemeEdit(switched with { Theme = target }, true, $"Theme changed to {target} to match the {(scheme == ColorScheme.Dark ? "dark" : "light")} scheme");
    }

    static string? CornersOf(string? radius)
    {
        if (radius is null)
        {
            return null;
        }

        var match = RemPattern().Match(radius.Trim());
        return match.Success
            ? $"{(int)Math.Round(double.Parse(match.Groups["value"].Value, CultureInfo.InvariantCulture) * 16, MidpointRounding.AwayFromZero)}px corners"
            : $"{radius.Trim()} corners";
    }

    [GeneratedRegex(@"^(?<value>\d+(?:\.\d+)?)rem$", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex RemPattern();
}
