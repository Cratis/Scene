// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Diagnostics.CodeAnalysis;
using System.Runtime.InteropServices;

namespace Cratis.Scene.Engine.Packages;

/// <summary>
/// Checks a <see cref="Model.Packages.PackageDependency.VersionRange"/> against a package's actual
/// version. A deliberately small subset of semver - enough to express what a package declaration
/// realistically needs, and small enough that the TypeScript twin in <c language="csharp">@cratis/scene.engine</c> can
/// match it exactly rather than approximately. Both sides are asserted against the same shared fixture
/// corpus.
/// </summary>
/// <remarks>
/// Supported: an empty range or <c language="csharp">*</c> (anything), a bare or <c language="csharp">=</c>-prefixed exact version,
/// <c language="csharp">^</c> (npm caret - compatible within the leftmost non-zero component), <c language="csharp">~</c> (patch-level
/// changes), and the comparisons <c language="csharp">&gt;=</c>, <c language="csharp">&gt;</c>, <c language="csharp">&lt;=</c>, <c language="csharp">&lt;</c>. Versions are read
/// as <c language="csharp">major.minor.patch</c> with any pre-release or build metadata suffix ignored - a package
/// declaring a pre-release version is compared on its numeric components alone. Anything the parser does
/// not recognize is treated as unsatisfiable rather than as "anything", so a typo surfaces as a conflict
/// instead of silently passing.
/// </remarks>
public static class PackageVersionRange
{
    static readonly (string Token, RangeOperator Operator)[] _operators =
    [
        (">=", RangeOperator.AtLeast),
        ("<=", RangeOperator.AtMost),
        ("^", RangeOperator.Caret),
        ("~", RangeOperator.Tilde),
        (">", RangeOperator.GreaterThan),
        ("<", RangeOperator.LessThan),
        ("=", RangeOperator.Exact)
    ];

    enum RangeOperator
    {
        Exact = 0,
        Caret = 1,
        Tilde = 2,
        AtLeast = 3,
        GreaterThan = 4,
        AtMost = 5,
        LessThan = 6
    }

    /// <summary>
    /// Whether a version satisfies a range.
    /// </summary>
    /// <param name="version">The version to check, as a package's <see cref="Model.Packages.ScenePackage.Version"/> carries it.</param>
    /// <param name="range">The range to check against, or <see langword="null"/> for "any version".</param>
    /// <returns><see langword="true"/> when <paramref name="version"/> satisfies <paramref name="range"/>.</returns>
    public static bool IsSatisfiedBy(string version, string? range)
    {
        var trimmed = range?.Trim();
        if (MatchesAnyVersion(trimmed))
        {
            return true;
        }

        if (!TryParse(version, out var actual))
        {
            return false;
        }

        var (op, literal) = Split(trimmed);
        if (!TryParse(literal, out var required))
        {
            return false;
        }

        return Satisfies(op, actual, required);
    }

    /// <summary>
    /// Whether a range is one <see cref="IsSatisfiedBy"/> understands. An empty range or <c language="csharp">*</c> is valid and
    /// means "any version"; anything the parser cannot read is invalid.
    /// </summary>
    /// <param name="range">The range to check.</param>
    /// <returns><see langword="true"/> when the range can be evaluated.</returns>
    public static bool IsValidRange(string? range)
    {
        var trimmed = range?.Trim();
        return MatchesAnyVersion(trimmed) || TryParse(Split(trimmed).Literal, out _);
    }

    /// <summary>
    /// Whether a value is a <c language="csharp">major.minor.patch</c> version, optionally with a pre-release or build suffix.
    /// </summary>
    /// <param name="version">The version to check.</param>
    /// <returns><see langword="true"/> when the version can be compared.</returns>
    public static bool IsValidVersion(string? version) =>
        !string.IsNullOrWhiteSpace(version) && TryParse(version, out _);

    /// <summary>
    /// Compares two versions as <c language="csharp">major.minor.patch</c>, pre-release and build suffixes ignored. A value that is not a version
    /// compares as older than every version, and equal to another that is not.
    /// </summary>
    /// <param name="left">The first version.</param>
    /// <param name="right">The second version.</param>
    /// <returns>Negative when <paramref name="left"/> is older, zero when equal, positive when newer.</returns>
    public static int CompareVersions(string? left, string? right)
    {
        var leftValid = TryParse(left ?? string.Empty, out var leftVersion);
        var rightValid = TryParse(right ?? string.Empty, out var rightVersion);
        if (!leftValid)
        {
            return rightValid ? -1 : 0;
        }

        return !rightValid ? 1 : Compare(leftVersion, rightVersion);
    }

    static bool MatchesAnyVersion([NotNullWhen(false)] string? trimmedRange) =>
        string.IsNullOrEmpty(trimmedRange) || trimmedRange == "*";

    static bool Satisfies(RangeOperator op, ParsedVersion actual, ParsedVersion required) =>
        op switch
        {
            RangeOperator.Caret => IsWithin(actual, required, CaretUpperBound(required)),
            RangeOperator.Tilde => IsWithin(actual, required, new ParsedVersion(required.Major, required.Minor + 1, 0)),
            _ => SatisfiesComparison(op, Compare(actual, required))
        };

    static bool SatisfiesComparison(RangeOperator op, int comparison) =>
        op switch
        {
            RangeOperator.AtLeast => comparison >= 0,
            RangeOperator.GreaterThan => comparison > 0,
            RangeOperator.AtMost => comparison <= 0,
            RangeOperator.LessThan => comparison < 0,
            _ => comparison == 0
        };

    static bool IsWithin(ParsedVersion actual, ParsedVersion lower, ParsedVersion upperExclusive) =>
        Compare(actual, lower) >= 0 && Compare(actual, upperExclusive) < 0;

    static (RangeOperator Operator, string Literal) Split(string range)
    {
        foreach (var (token, op) in _operators)
        {
            if (range.StartsWith(token, StringComparison.Ordinal))
            {
                return (op, range[token.Length..].Trim());
            }
        }

        return (RangeOperator.Exact, range);
    }

    /// <summary>
    /// Applies npm's caret rule: compatibility is bounded by the leftmost non-zero component, so
    /// <c language="csharp">^1.2.3</c> allows anything below <c language="csharp">2.0.0</c>, <c language="csharp">^0.2.3</c> anything below <c language="csharp">0.3.0</c>, and
    /// <c language="csharp">^0.0.3</c> only <c language="csharp">0.0.3</c> itself.
    /// </summary>
    /// <param name="version">The version the caret was written against.</param>
    /// <returns>The exclusive upper bound the caret allows.</returns>
    static ParsedVersion CaretUpperBound(ParsedVersion version) =>
        version switch
        {
            { Major: > 0 } => new ParsedVersion(version.Major + 1, 0, 0),
            { Minor: > 0 } => new ParsedVersion(0, version.Minor + 1, 0),
            _ => new ParsedVersion(0, 0, version.Patch + 1)
        };

    static int Compare(ParsedVersion left, ParsedVersion right) =>
        (left.Major, left.Minor, left.Patch).CompareTo((right.Major, right.Minor, right.Patch));

    static bool TryParse(string value, out ParsedVersion version)
    {
        version = default;
        var parts = WithoutSuffix(value.Trim()).Split('.');
        if (parts.Length is 0 or > 3 || !TryParseComponents(parts, out var components))
        {
            return false;
        }

        version = new ParsedVersion(components[0], components[1], components[2]);
        return true;
    }

    static string WithoutSuffix(string numeric)
    {
        var suffix = numeric.IndexOfAny(['-', '+']);
        return suffix >= 0 ? numeric[..suffix] : numeric;
    }

    static bool TryParseComponents(string[] parts, out int[] components)
    {
        components = new int[3];
        for (var index = 0; index < parts.Length; index++)
        {
            if (!int.TryParse(parts[index], out components[index]) || components[index] < 0)
            {
                return false;
            }
        }

        return true;
    }

    [StructLayout(LayoutKind.Auto)]
    readonly record struct ParsedVersion(int Major, int Minor, int Patch);
}
