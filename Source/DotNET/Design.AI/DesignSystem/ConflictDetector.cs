// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text.RegularExpressions;

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// Finds the values the sources a design system is established from use for what looks like the same purpose - two nearly identical colors, corner radii a
/// pixel or two apart - with how often and where each is used.
/// </summary>
/// <remarks>
/// Ported from Direct's <c language="text">ConflictDetector</c>, so a product that moves its design system to Scene keeps the conflicts it already knows.
/// </remarks>
public static partial class ConflictDetector
{
    /// <summary>
    /// The largest distance between two colors, in red, green and blue, for them to count as the same one written twice.
    /// </summary>
    public const double ColorDistance = 12;

    /// <summary>
    /// The largest difference between two corner radii, in pixels, for them to count as the same one written twice.
    /// </summary>
    public const double RadiusDifference = 2;

    /// <summary>
    /// The most conflicts of one kind reported, so a decision stays a decision.
    /// </summary>
    public const int MaxPerKind = 6;

    /// <summary>
    /// The most files named for one value.
    /// </summary>
    public const int MaxPlaces = 3;

    /// <summary>
    /// Finds the conflicts in a set of sources. Only the sources that are text are read.
    /// </summary>
    /// <param name="sources">The sources.</param>
    /// <returns>The conflicts, colors first.</returns>
    public static IReadOnlyList<DesignSystemConflict> Detect(IEnumerable<DesignSource> sources)
    {
        var files = sources.Where(source => source.Content.Length > 0).ToList();
        var colors = Count(files, ColorsIn);
        var radii = Count(files, RadiiIn);
        return
        [
            .. Group(colors, DesignSystemConflictKind.Color, (first, second) => Distance(first, second) <= ColorDistance, value => $"Colors: {value}").Take(MaxPerKind),
            .. Group(radii, DesignSystemConflictKind.Corner, (first, second) => Math.Abs(Pixels(first) - Pixels(second)) <= RadiusDifference, value => $"Corners: {value}").Take(MaxPerKind),
        ];
    }

    [GeneratedRegex(@"#(?<hex>[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z])", RegexOptions.ExplicitCapture, 1000)]
    private static partial Regex HexColor();

    [GeneratedRegex(@"(?:border-radius|--[\w-]*radius[\w-]*|rounded-\[)\s*:?\s*(?<value>\d+(?:\.\d+)?(?:px|rem))", RegexOptions.IgnoreCase | RegexOptions.ExplicitCapture, 1000)]
    private static partial Regex Radius();

    [GeneratedRegex(@"borderRadius\s*:\s*\{(?<block>[^}]*)\}", RegexOptions.IgnoreCase | RegexOptions.ExplicitCapture, 1000)]
    private static partial Regex RadiusScale();

    [GeneratedRegex(@"['""](?<value>\d+(?:\.\d+)?(?:px|rem))['""]", RegexOptions.IgnoreCase | RegexOptions.ExplicitCapture, 1000)]
    private static partial Regex QuotedLength();

    static IEnumerable<string> ColorsIn(string content) =>
        HexColor().Matches(content).Select(match => Normalize(match.Groups["hex"].Value));

    static IEnumerable<string> RadiiIn(string content)
    {
        foreach (var match in Radius().Matches(content).Cast<Match>())
        {
            yield return match.Groups["value"].Value.ToLowerInvariant();
        }

        foreach (var block in RadiusScale().Matches(content).Cast<Match>())
        {
            foreach (var value in QuotedLength().Matches(block.Groups["block"].Value).Cast<Match>())
            {
                yield return value.Groups["value"].Value.ToLowerInvariant();
            }
        }
    }

    static Dictionary<string, List<ConflictPlace>> Count(List<DesignSource> files, Func<string, IEnumerable<string>> read)
    {
        var counted = new Dictionary<string, List<ConflictPlace>>(StringComparer.Ordinal);
        foreach (var file in files)
        {
            foreach (var group in read(file.Content).GroupBy(value => value, StringComparer.Ordinal))
            {
                if (!counted.TryGetValue(group.Key, out var places))
                {
                    counted[group.Key] = places = [];
                }

                places.Add(new($"{file.Origin}: {file.Name}", group.Count()));
            }
        }

        return counted;
    }

    static IEnumerable<DesignSystemConflict> Group(Dictionary<string, List<ConflictPlace>> counted, DesignSystemConflictKind kind, Func<string, string, bool> close, Func<string, string> describe)
    {
        var values = counted.Keys.Order(StringComparer.Ordinal).ToList();
        var parent = values.ToDictionary(value => value, value => value, StringComparer.Ordinal);
        string Root(string value) => parent[value] == value ? value : parent[value] = Root(parent[value]);
        for (var first = 0; first < values.Count; first++)
        {
            for (var second = first + 1; second < values.Count; second++)
            {
                if (close(values[first], values[second]))
                {
                    parent[Root(values[second])] = Root(values[first]);
                }
            }
        }

        foreach (var members in values.GroupBy(Root, StringComparer.Ordinal).Where(group => group.Count() > 1))
        {
            var options = members
                .Select(value => new ConflictOption(value, counted[value].Sum(place => place.Count), [.. counted[value].OrderByDescending(place => place.Count).ThenBy(place => place.Source, StringComparer.Ordinal).Take(MaxPlaces)]))
                .OrderByDescending(option => option.Count).ThenBy(option => option.Value, StringComparer.Ordinal)
                .ToList();
            var ordered = string.Join(" or ", options.Select(option => option.Value));
            yield return new($"{kind.ToString().ToLowerInvariant()}:{string.Join('|', members.Order(StringComparer.Ordinal))}", kind, $"{describe(ordered)}?", options);
        }
    }

    static string Normalize(string hex)
    {
        var full = hex.Length == 3 ? string.Concat(hex.Select(digit => $"{digit}{digit}")) : hex;
        return $"#{full.ToLowerInvariant()}";
    }

    static double Distance(string first, string second)
    {
        var (red1, green1, blue1) = Rgb(first);
        var (red2, green2, blue2) = Rgb(second);
        return Math.Sqrt(Math.Pow(red1 - red2, 2) + Math.Pow(green1 - green2, 2) + Math.Pow(blue1 - blue2, 2));
    }

    static (int Red, int Green, int Blue) Rgb(string hex) =>
        (int.Parse(hex[1..3], NumberStyles.HexNumber, CultureInfo.InvariantCulture), int.Parse(hex[3..5], NumberStyles.HexNumber, CultureInfo.InvariantCulture), int.Parse(hex[5..7], NumberStyles.HexNumber, CultureInfo.InvariantCulture));

    static double Pixels(string length)
    {
        var rem = length.EndsWith("rem", StringComparison.Ordinal);
        var number = double.Parse(length[..^(rem ? 3 : 2)], CultureInfo.InvariantCulture);
        return rem ? number * 16 : number;
    }
}
