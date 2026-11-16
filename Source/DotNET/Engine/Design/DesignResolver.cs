// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Profiles;
using Cratis.Scene.Model.DesignSystems;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Design;

/// <summary>
/// Resolves a design system for what a profile asks of it: the theme, the mode its colour scheme selects, and the accent, corners and font it
/// replaces the theme's own with. One function for Studio's preview, Stage and generated React, so they cannot disagree about which theme and mode a
/// profile gets; the TypeScript engine has the same function, asserted against the same corpus.
/// </summary>
public static class DesignResolver
{
    /// <summary>
    /// Resolves the design system.
    /// </summary>
    /// <remarks>
    /// The mode follows the colour scheme (<see cref="ColorScheme.System"/> follows the system); when the scheme is not a mode the design system declares, its
    /// first mode is used. A theme named by the profile that the design system does not have is looked up among the themes of the packages; one nobody has
    /// falls back to the default theme with a diagnostic.
    /// </remarks>
    /// <param name="designSystem">The design system to draw.</param>
    /// <param name="theme">The name of the theme the profile selects. <see langword="null"/>, or an unknown name, selects the design system's default theme.</param>
    /// <param name="packageThemes">Themes the active packages ship, each a flat map of token values for one mode. A name that is not one of the design system's own themes is looked up here.</param>
    /// <param name="appearance">The appearance of the profile.</param>
    /// <param name="systemIsDark">Whether the system is in dark mode; decides <see cref="ColorScheme.System"/>.</param>
    /// <param name="availableFonts">The ids of the fonts the host can use, or <see langword="null"/> for every font of the catalog.</param>
    /// <returns>The theme, mode, token values and resolved components to draw, and a diagnostic for everything that was refused.</returns>
    public static ResolvedDesign Resolve(
        DesignSystem designSystem,
        string? theme = null,
        IReadOnlyList<Theme>? packageThemes = null,
        ProfileAppearance? appearance = null,
        bool systemIsDark = false,
        IReadOnlyCollection<string>? availableFonts = null)
    {
        var diagnostics = new List<DesignDiagnostic>();
        var modes = designSystem.Modes;
        var requested = appearance?.ColorScheme;
        var scheme = requested == ColorScheme.System ? (systemIsDark ? ColorScheme.Dark : ColorScheme.Light) : requested;
        var schemeMode = scheme is null ? null : scheme == ColorScheme.Dark ? "dark" : "light";

        var own = theme is null ? null : designSystem.Themes.FirstOrDefault(candidate => candidate.Name == theme);
        var shipped = own is not null || theme is null ? null : packageThemes?.FirstOrDefault(candidate => candidate.Name == theme);
        if (theme is not null && own is null && shipped is null)
        {
            diagnostics.Add(new(
                DesignDiagnosticCode.ThemeNotFound,
                $"The theme '{theme}' is not a theme of the design system '{designSystem.Name}' or of its packages, so the default theme is used."));
        }

        var designTheme = own ?? (shipped is null ? (designSystem.Themes.FirstOrDefault(candidate => candidate.IsDefault) ?? (designSystem.Themes.Count > 0 ? designSystem.Themes[0] : null)) : null);

        string? mode;
        string themeName;
        bool isDark;
        DesignThemeMode? values;

        if (shipped is not null)
        {
            themeName = shipped.Name;
            isDark = shipped.IsDark;
            var native = isDark ? "dark" : "light";
            mode = modes.Count == 0 || modes.Contains(native) ? native : modes[0];
            values = new DesignThemeMode(mode, new Dictionary<string, string>(shipped.Tokens ?? new Dictionary<string, string>(), StringComparer.Ordinal));
        }
        else
        {
            themeName = designTheme?.Name ?? designSystem.Name;
            if (schemeMode is not null && !modes.Contains(schemeMode) && requested != ColorScheme.System)
            {
                diagnostics.Add(new(
                    DesignDiagnosticCode.ModeNotDeclared,
                    $"The colour scheme {schemeMode} is not a mode of the design system '{designSystem.Name}', so its first mode is used."));
            }

            mode = schemeMode is not null && modes.Contains(schemeMode) ? schemeMode : (modes.Count > 0 ? modes[0] : null);
            values = designTheme?.Modes.FirstOrDefault(candidate => candidate.Mode == mode);
            if (designTheme is not null && values is null && mode is not null)
            {
                diagnostics.Add(new(DesignDiagnosticCode.ModeNotImplemented, $"The theme '{designTheme.Name}' has no values for the mode '{mode}'."));
            }

            isDark = mode == "dark";
        }

        var themed = new Theme(themeName, [], new Dictionary<string, string>(values?.Tokens ?? new Dictionary<string, string>(), StringComparer.Ordinal), isDark);

        // The mode already follows the colour scheme, so the theme is drawn as chosen; only a theme shipped by a package, which has one scheme of its own, is checked against it.
        var themeAppearance = shipped is null ? (appearance ?? new ProfileAppearance()) with { ColorScheme = null } : appearance;
        var resolved = AppearanceResolver.Resolve(themed, themeAppearance, systemIsDark, availableFonts, designSystem.Appearance ?? new AppearanceBindings());

        var unchanged = values is not null
            && resolved.Tokens.Count == values.Tokens.Count
            && resolved.Tokens.All(entry => values.Tokens.TryGetValue(entry.Key, out var original) && original == entry.Value);
        var components = values?.Components;
        if (components is null || !unchanged)
        {
            var evaluated = DesignComponentEvaluator.Evaluate(designSystem.Components, resolved.Tokens, shipped is null);
            components = evaluated.Components;
            diagnostics.AddRange(evaluated.Problems.Select(problem => new DesignDiagnostic(DesignDiagnosticCode.TokenUnresolved, problem)));
        }

        return new(designSystem.Name, themeName, mode, resolved.ColorScheme, resolved.Tokens, components, resolved, diagnostics);
    }
}
