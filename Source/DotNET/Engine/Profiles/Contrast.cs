// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Measures how well white text reads on a colour. The TypeScript twin is <c language="csharp">contrastAgainstWhite</c>.
/// </summary>
public static class Contrast
{
    /// <summary>
    /// The ratio an accent must reach against white button text.
    /// </summary>
    public const double MinimumAccent = 3;

    const string Invalid = "Enter a 3- or 6-digit hex colour, like #0a7 or #00aa77";

    static readonly int[] _starts = [0, 2, 4];

    /// <summary>
    /// Measures the contrast of a colour against white. Accepts three- or six-digit hex colours, with or without the <c language="csharp">#</c>; anything else is reported with a message.
    /// </summary>
    /// <param name="color">The colour.</param>
    /// <returns>The ratio and its grade, or why the colour cannot be read.</returns>
    public static ContrastResult AgainstWhite(string color)
    {
        var text = color.Trim();
        if (text.StartsWith('#'))
        {
            text = text[1..];
        }

        if ((text.Length != 3 && text.Length != 6) || !text.All(Uri.IsHexDigit))
        {
            return new ContrastResult(false, null, null, Invalid);
        }

        if (text.Length == 3)
        {
            text = string.Concat(text.Select(digit => $"{digit}{digit}"));
        }

        var channels = _starts.Select(start => Convert.ToInt32(text.Substring(start, 2), 16) / 255.0).Select(value => value <= 0.03928 ? value / 12.92 : Math.Pow((value + 0.055) / 1.055, 2.4)).ToArray();
        var luminance = (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
        var ratio = Math.Round(1.05 / (luminance + 0.05) * 100, MidpointRounding.AwayFromZero) / 100;
        var grade = ratio >= 7 ? ContrastGrade.Aaa : ratio >= 4.5 ? ContrastGrade.Aa : ratio >= MinimumAccent ? ContrastGrade.LargeTextOnly : ContrastGrade.Fails;
        return new ContrastResult(true, ratio, grade, null);
    }
}
