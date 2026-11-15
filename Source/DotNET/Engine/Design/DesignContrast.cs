// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text.RegularExpressions;
using Cratis.Scene.Engine.Profiles;
using Cratis.Scene.Model.DesignSystems;

namespace Cratis.Scene.Engine.Design;

/// <summary>
/// Measures the contrast of a design system's colors. The TypeScript twin is <c language="csharp">measureDesignContrast</c>.
/// </summary>
public static partial class DesignContrast
{
    /// <summary>
    /// The state a rule never applies to: a disabled control is exempt from contrast requirements.
    /// </summary>
    const string ExemptState = "disabled";

    /// <summary>
    /// Measures the WCAG contrast ratio of one color against another. Only colors written as hex (<c language="csharp">#rgb</c>, <c language="csharp">#rrggbb</c>,
    /// <c language="csharp">#rrggbbaa</c>) or <c language="csharp">rgb(...)</c> literals can be measured; a named color, a gradient or a reference is not checked.
    /// </summary>
    /// <param name="foreground">The color drawn on the background.</param>
    /// <param name="background">The color it is drawn on.</param>
    /// <returns>The ratio, rounded to two decimals, or <see langword="null"/> when either color cannot be measured.</returns>
    public static double? Ratio(string foreground, string background)
    {
        var front = Channels(foreground);
        var back = Channels(background);
        if (front is null || back is null)
        {
            return null;
        }

        var a = Luminance(front.Value);
        var b = Luminance(back.Value);
        return Math.Round((Math.Max(a, b) + 0.05) / (Math.Min(a, b) + 0.05) * 100, MidpointRounding.AwayFromZero) / 100;
    }

    /// <summary>
    /// Measures every contrast rule of a design system for every theme and mode, over every variant and every state except <c language="csharp">disabled</c>.
    /// A pair that falls short is a finding whose <see cref="ContrastFinding.Ratio"/> is below its <see cref="ContrastFinding.Required"/>; a pair that cannot be measured is left out.
    /// </summary>
    /// <param name="designSystem">The design system.</param>
    /// <returns>The findings, in theme, mode, component, variant, state order.</returns>
    public static IReadOnlyList<ContrastFinding> Measure(DesignSystem designSystem)
    {
        var findings = new List<ContrastFinding>();
        foreach (var theme in designSystem.Themes)
        {
            foreach (var values in theme.Modes)
            {
                var components = values.Components ?? DesignComponentEvaluator.Evaluate(designSystem.Components, values.Tokens, false).Components;
                foreach (var rule in designSystem.ContrastRules ?? [])
                {
                    foreach (var component in components)
                    {
                        foreach (var variant in component.Variants)
                        {
                            var pairs = new List<(string? State, IReadOnlyDictionary<string, string> Parts)> { (null, variant.Parts) };
                            pairs.AddRange((variant.States ?? new Dictionary<string, IReadOnlyDictionary<string, string>>())
                                .Where(state => state.Key != ExemptState)
                                .Select(state => ((string?)state.Key, state.Value)));

                            foreach (var (state, parts) in pairs)
                            {
                                if (!parts.TryGetValue(rule.Foreground, out var foreground) || !parts.TryGetValue(rule.Background, out var background))
                                {
                                    continue;
                                }

                                if (Ratio(foreground, background) is { } ratio)
                                {
                                    findings.Add(new(theme.Name, values.Mode, component.Name, variant.Name, state, rule.Foreground, rule.Background, ratio, rule.MinimumRatio));
                                }
                            }
                        }
                    }
                }
            }
        }

        return findings;
    }

    static (int Red, int Green, int Blue)? Channels(string color)
    {
        var text = color.Trim();
        if (AppearanceResolver.ParseHexColor(text) is { } hex)
        {
            return hex;
        }

        var match = RgbPattern().Match(text);
        if (!match.Success)
        {
            return null;
        }

        var red = int.Parse(match.Groups["r"].Value, CultureInfo.InvariantCulture);
        var green = int.Parse(match.Groups["g"].Value, CultureInfo.InvariantCulture);
        var blue = int.Parse(match.Groups["b"].Value, CultureInfo.InvariantCulture);
        return red <= 255 && green <= 255 && blue <= 255 ? (red, green, blue) : null;
    }

    static double Luminance((int Red, int Green, int Blue) rgb)
    {
        static double Linear(int channel)
        {
            var value = channel / 255d;
            return value <= 0.03928 ? value / 12.92 : Math.Pow((value + 0.055) / 1.055, 2.4);
        }

        return (0.2126 * Linear(rgb.Red)) + (0.7152 * Linear(rgb.Green)) + (0.0722 * Linear(rgb.Blue));
    }

    [GeneratedRegex(@"^rgba?\(\s*(?<r>\d{1,3})\s*[,\s]\s*(?<g>\d{1,3})\s*[,\s]\s*(?<b>\d{1,3})\s*(?:[,/]\s*[\d.]+%?\s*)?\)$", RegexOptions.CultureInvariant | RegexOptions.IgnoreCase | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex RgbPattern();
}
