// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.RegularExpressions;
using Cratis.Scene.Design.Catalogue;
using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Checks and applies changes to the UI profile. The TypeScript twin is <c language="text">profileOperations</c>.
/// </summary>
public static partial class DesignProfileOperations
{
    /// <summary>
    /// Gets the values a key of the profile takes, as the catalogue lists them.
    /// </summary>
    /// <param name="catalogue">The catalogue.</param>
    /// <param name="key">The key.</param>
    /// <returns>The result.</returns>
    public static IReadOnlyList<string>? KeyValues(DesignCatalogue catalogue, string key)
    {
        var values = catalogue.Profile?.Values;
        return values is null
            ? null
            : key switch
            {
                DesignProfileKeys.Theme => values.Themes,
                DesignProfileKeys.ColorScheme => values.ColorSchemes,
                DesignProfileKeys.Corners => values.Corners,
                DesignProfileKeys.Font => values.Fonts,
                DesignProfileKeys.RootTemplate => values.RootTemplates,
                DesignProfileKeys.NewScreenTemplate => values.NewScreenTemplates,
                _ => null,
            };
    }

    /// <summary>
    /// Gets the current value of a key, as text.
    /// </summary>
    /// <param name="profile">The profile.</param>
    /// <param name="key">The key.</param>
    /// <returns>The result.</returns>
    public static string Value(UiProfile profile, string key) => key switch
    {
        DesignProfileKeys.Theme => profile.Theme ?? string.Empty,
        DesignProfileKeys.ColorScheme => profile.Appearance?.ColorScheme?.ToString() ?? string.Empty,
        DesignProfileKeys.Accent => profile.Appearance?.Accent ?? string.Empty,
        DesignProfileKeys.Corners => profile.Appearance?.Corners?.ToString() ?? string.Empty,
        DesignProfileKeys.Font => profile.Appearance?.Font ?? string.Empty,
        DesignProfileKeys.RootTemplate => profile.Root?.Template.Id ?? string.Empty,
        DesignProfileKeys.NewScreenTemplate => profile.Defaults?.NewScreenTemplate?.Id ?? string.Empty,
        _ => string.Empty,
    };

    /// <summary>
    /// Gets the profile with one key changed. The value must have been checked.
    /// </summary>
    /// <param name="profile">The profile.</param>
    /// <param name="key">The key.</param>
    /// <param name="value">The value.</param>
    /// <returns>The result.</returns>
    public static UiProfile Apply(UiProfile profile, string key, string value) => key switch
    {
        DesignProfileKeys.Theme => profile with { Theme = value },
        DesignProfileKeys.ColorScheme => profile with { Appearance = (profile.Appearance ?? new ProfileAppearance()) with { ColorScheme = Enum.Parse<ColorScheme>(value, true) } },
        DesignProfileKeys.Accent => profile with { Appearance = (profile.Appearance ?? new ProfileAppearance()) with { Accent = value } },
        DesignProfileKeys.Corners => profile with { Appearance = (profile.Appearance ?? new ProfileAppearance()) with { Corners = Enum.Parse<CornerStyle>(value, true) } },
        DesignProfileKeys.Font => profile with { Appearance = (profile.Appearance ?? new ProfileAppearance()) with { Font = value } },
        DesignProfileKeys.RootTemplate => profile with { Root = new RootTemplate(Reference(profile.Root?.Template, value), profile.Root?.Options) },
        DesignProfileKeys.NewScreenTemplate => profile with { Defaults = (profile.Defaults ?? new ProfileDefaults()) with { NewScreenTemplate = Reference(profile.Defaults?.NewScreenTemplate, value) } },
        _ => profile,
    };

    /// <summary>
    /// Gets the colours the design system declares.
    /// </summary>
    /// <param name="catalogue">The catalogue.</param>
    /// <returns>The result.</returns>
    internal static IReadOnlyList<string> ColourTokenValues(DesignCatalogue catalogue) =>
        [.. catalogue.Tokens.Where(token => token.Category == "color").SelectMany(token => token.Values.Select(value => value.Value)).Distinct()];

    /// <summary>
    /// Gets the proposal that would let a value through: the design system gains a token for it.
    /// </summary>
    /// <param name="value)">The value).</param>
    /// <returns>The result.</returns>
    internal static DesignSystemProposal TokenProposal(string value) => new("token", $"Add a design-system token for {value}", Value: value);

    /// <summary>
    /// Checks a value of a profile key against the catalogue; an accent must be a colour the design system declares, when it declares any.
    /// </summary>
    /// <param name="catalogue">The catalogue.</param>
    /// <param name="key">The key.</param>
    /// <param name="value">The value.</param>
    /// <returns>The result.</returns>
    internal static DesignRefusal? Check(DesignCatalogue catalogue, string key, string value)
    {
        if (catalogue.Profile is null)
        {
            return DesignRefusal.Of(DesignRefusalCode.NoProfile, DesignMessages.NoProfile);
        }

        if (!DesignProfileKeys.All.Contains(key))
        {
            return DesignRefusal.Of(DesignRefusalCode.ProfileKeyUnknown, DesignMessages.ProfileKeyUnknown(key));
        }

        if (key == DesignProfileKeys.Accent)
        {
            if (!Hex().IsMatch(value))
            {
                return DesignRefusal.Of(DesignRefusalCode.ProfileValueNotAllowed, DesignMessages.ProfileValueNotAllowed(key, value, []));
            }

            var declared = ColourTokenValues(catalogue);
            if (declared.Count > 0 && !declared.Any(colour => string.Equals(colour, value, StringComparison.OrdinalIgnoreCase)))
            {
                return new DesignRefusal(
                    DesignRefusalCode.OffSystemValue,
                    DesignMessages.OffSystem(value),
                    [new DesignAlternative($"Propose {value} to the design system", null, TokenProposal(value))]);
            }

            return null;
        }

        var allowed = KeyValues(catalogue, key) ?? [];
        return allowed.Contains(value) ? null : DesignRefusal.Of(DesignRefusalCode.ProfileValueNotAllowed, DesignMessages.ProfileValueNotAllowed(key, value, allowed));
    }

    [GeneratedRegex("^#[0-9a-f]{6}$", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture | RegexOptions.IgnoreCase, matchTimeoutMilliseconds: 1000)]
    private static partial Regex Hex();

    static TemplateReference Reference(TemplateReference? current, string id) =>
        current is null ? new TemplateReference(TemplateReferenceSource.Own, id) : current with { Id = id };
}
