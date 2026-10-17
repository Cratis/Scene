// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text.RegularExpressions;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Resolves the appearance of a profile: scheme, theme, accent, corners and font in, effective tokens out. One function for Studio's preview, Stage and
/// generated React, so they cannot disagree about what a corner style or an accent means; the TypeScript engine has the same function, asserted against the same corpus.
/// </summary>
public static partial class AppearanceResolver
{
    /// <summary>
    /// Resolves the appearance.
    /// </summary>
    /// <param name="theme">The theme the profile selects, or <see langword="null"/> when there are no theme tokens to start from.</param>
    /// <param name="appearance">The appearance of the profile.</param>
    /// <param name="systemIsDark">Whether the system is in dark mode; decides <see cref="ColorScheme.System"/>.</param>
    /// <param name="availableFonts">The ids of the fonts the host can use, or <see langword="null"/> for every font of the catalog.</param>
    /// <returns>The scheme and tokens to apply, and a diagnostic for everything that was refused.</returns>
    public static ResolvedAppearance Resolve(Theme? theme, ProfileAppearance? appearance, bool systemIsDark = false, IReadOnlyCollection<string>? availableFonts = null)
    {
        appearance ??= new ProfileAppearance();
        var diagnostics = new List<AppearanceDiagnostic>();
        var tokens = new Dictionary<string, string>(theme?.Tokens ?? new Dictionary<string, string>(), StringComparer.Ordinal);

        var requested = appearance.ColorScheme ?? (theme?.IsDark is true ? ColorScheme.Dark : ColorScheme.Light);
        var colorScheme = requested == ColorScheme.System ? (systemIsDark ? ColorScheme.Dark : ColorScheme.Light) : requested;

        if (theme is not null && appearance.ColorScheme is not null && (theme.IsDark ? ColorScheme.Dark : ColorScheme.Light) != colorScheme)
        {
            diagnostics.Add(new(
                AppearanceDiagnosticCode.ThemeSchemeMismatch,
                $"The theme '{theme.Name}' is a {(theme.IsDark ? "dark" : "light")} theme, but the colour scheme is {(colorScheme == ColorScheme.Dark ? "dark" : "light")}."));
        }

        if (!string.IsNullOrEmpty(appearance.Accent))
        {
            var rgb = ParseHexColor(appearance.Accent);
            if (rgb is null)
            {
                diagnostics.Add(new(AppearanceDiagnosticCode.AccentInvalid, $"The accent '{appearance.Accent}' is not a hex colour such as #4f46e5, so the theme's accent is kept."));
            }
            else
            {
                tokens["primary.color"] = appearance.Accent;
                tokens["focus.ring"] = string.Create(CultureInfo.InvariantCulture, $"0 0 0 2px rgb({rgb.Value.Red} {rgb.Value.Green} {rgb.Value.Blue} / 0.4)");
            }
        }

        var radius = (appearance.Corners ?? CornerStyle.Default) switch
        {
            CornerStyle.Sharp => "4px",
            CornerStyle.Round => "18px",
            _ => null
        };
        if (radius is not null)
        {
            tokens["content.borderRadius"] = radius;
        }

        FontChoice? font = null;
        if (!string.IsNullOrEmpty(appearance.Font))
        {
            var found = FontCatalog.Find(appearance.Font);
            font = FontCatalog.Find(FontCatalog.SystemFontId)!;
            if (found is not null && availableFonts?.Contains(found.Id) != false)
            {
                font = found;
            }
            else
            {
                diagnostics.Add(new(AppearanceDiagnosticCode.FontUnavailable, $"The font '{appearance.Font}' is not available, so the system font is used."));
            }

            tokens["text.fontFamily"] = font.Family;
        }

        return new(colorScheme, tokens, font?.Id, font?.Source == FontSource.Hosted ? font.Stylesheet : null, diagnostics);
    }

    /// <summary>
    /// Reads a 3-, 4-, 6- or 8-digit hex colour.
    /// </summary>
    /// <param name="value">The colour text.</param>
    /// <returns>The red, green and blue channels, or <see langword="null"/> when the text is not a hex colour.</returns>
    public static (int Red, int Green, int Blue)? ParseHexColor(string value)
    {
        if (!HexPattern().IsMatch(value))
        {
            return null;
        }

        var digits = value[1..];
        var wide = digits.Length <= 4;
        int Channel(int index) => int.Parse(wide ? new string(digits[index], 2) : digits.Substring(index * 2, 2), NumberStyles.HexNumber, CultureInfo.InvariantCulture);
        return (Channel(0), Channel(1), Channel(2));
    }

    [GeneratedRegex(@"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$", RegexOptions.CultureInvariant, matchTimeoutMilliseconds: 1000)]
    private static partial Regex HexPattern();
}
