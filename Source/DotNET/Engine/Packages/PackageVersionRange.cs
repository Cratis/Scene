// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Packages;

/// <summary>
/// Checks a <see cref="Model.Packages.PackageDependency.VersionRange"/> against a package's actual
/// version. A deliberately small subset of semver - enough to express what a package declaration
/// realistically needs, and small enough that the TypeScript twin in <c>@cratis/scene.engine</c> can
/// match it exactly rather than approximately. Both sides are asserted against the same shared fixture
/// corpus.
/// </summary>
/// <remarks>
/// Supported: an empty range or <c>*</c> (anything), a bare or <c>=</c>-prefixed exact version,
/// <c>^</c> (npm caret - compatible within the leftmost non-zero component), <c>~</c> (patch-level
/// changes), and the comparisons <c>&gt;=</c>, <c>&gt;</c>, <c>&lt;=</c>, <c>&lt;</c>. Versions are read
/// as <c>major.minor.patch</c> with any pre-release or build metadata suffix ignored - a package
/// declaring a pre-release version is compared on its numeric components alone. Anything the parser does
/// not recognize is treated as unsatisfiable rather than as "anything", so a typo surfaces as a conflict
/// instead of silently passing.
/// </remarks>
public static class PackageVersionRange
{
    /// <summary>
    /// Whether a version satisfies a range.
    /// </summary>
    /// <param name="version">The version to check, as a package's <see cref="Model.Packages.ScenePackage.Version"/> carries it.</param>
    /// <param name="range">The range to check against, or <see langword="null"/> for "any version".</param>
    /// <returns><see langword="true"/> when <paramref name="version"/> satisfies <paramref name="range"/>.</returns>
    public static bool IsSatisfiedBy(string version, string? range)
    {
        var trimmed = range?.Trim();
        if (string.IsNullOrEmpty(trimmed) || trimmed == "*")
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

        return op switch
        {
            "^" => Compare(actual, required) >= 0 && Compare(actual, CaretUpperBound(required)) < 0,
            "~" => Compare(actual, required) >= 0 && Compare(actual, (required.Major, required.Minor + 1, 0)) < 0,
            ">=" => Compare(actual, required) >= 0,
            ">" => Compare(actual, required) > 0,
            "<=" => Compare(actual, required) <= 0,
            "<" => Compare(actual, required) < 0,
            _ => Compare(actual, required) == 0
        };
    }

    static (string Operator, string Literal) Split(string range)
    {
        foreach (var op in (string[])[">=", "<=", "^", "~", ">", "<", "="])
        {
            if (range.StartsWith(op, StringComparison.Ordinal))
            {
                return (op == "=" ? string.Empty : op, range[op.Length..].Trim());
            }
        }

        return (string.Empty, range);
    }

    /// <summary>
    /// Applies npm's caret rule: compatibility is bounded by the leftmost non-zero component, so
    /// <c>^1.2.3</c> allows anything below <c>2.0.0</c>, <c>^0.2.3</c> anything below <c>0.3.0</c>, and
    /// <c>^0.0.3</c> only <c>0.0.3</c> itself.
    /// </summary>
    /// <param name="version">The version the caret was written against.</param>
    /// <returns>The exclusive upper bound the caret allows.</returns>
    static (int Major, int Minor, int Patch) CaretUpperBound((int Major, int Minor, int Patch) version) =>
        version switch
        {
            { Major: > 0 } => (version.Major + 1, 0, 0),
            { Minor: > 0 } => (0, version.Minor + 1, 0),
            _ => (0, 0, version.Patch + 1)
        };

    static int Compare((int Major, int Minor, int Patch) left, (int Major, int Minor, int Patch) right)
    {
        if (left.Major != right.Major) return left.Major.CompareTo(right.Major);
        if (left.Minor != right.Minor) return left.Minor.CompareTo(right.Minor);
        return left.Patch.CompareTo(right.Patch);
    }

    static bool TryParse(string value, out (int Major, int Minor, int Patch) version)
    {
        version = default;
        var numeric = value.Trim();
        var suffix = numeric.IndexOfAny(['-', '+']);
        if (suffix >= 0)
        {
            numeric = numeric[..suffix];
        }

        var parts = numeric.Split('.');
        if (parts.Length is 0 or > 3)
        {
            return false;
        }

        var components = new int[3];
        for (var index = 0; index < parts.Length; index++)
        {
            if (!int.TryParse(parts[index], out components[index]) || components[index] < 0)
            {
                return false;
            }
        }

        version = (components[0], components[1], components[2]);
        return true;
    }
}
