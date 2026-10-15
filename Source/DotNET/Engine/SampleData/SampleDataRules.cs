// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.RegularExpressions;

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// Plain string rules for sample-data identities, locales, owners and paths, matching the TypeScript engine exactly.
/// </summary>
public static partial class SampleDataRules
{
    /// <summary>The owner of a pack the author created.</summary>
    public const string UserOwner = "user";

    /// <summary>The prefix of the owner of a pack a blueprint ships (<c language="csharp">blueprint:crm</c>).</summary>
    public const string BlueprintOwnerPrefix = "blueprint:";

    const string PathPrefix = "sampleData/";
    const string PathSuffix = ".json";

    /// <summary>
    /// Whether an id is lower-case letters and digits in groups separated by <c language="csharp">.</c>, <c language="csharp">_</c> or <c language="csharp">-</c>.
    /// </summary>
    /// <param name="value">The value to check.</param>
    /// <returns><see langword="true"/> for a valid id.</returns>
    public static bool IsValidId(string? value) => value is not null && IdPattern().IsMatch(value);

    /// <summary>
    /// Whether a locale is a BCP 47 style tag: a 2-3 letter language followed by alphanumeric subtags.
    /// </summary>
    /// <param name="value">The value to check.</param>
    /// <returns><see langword="true"/> for a valid tag.</returns>
    public static bool IsValidLocale(string? value) => value is not null && LocalePattern().IsMatch(value);

    /// <summary>
    /// Whether an owner is <c language="csharp">user</c> or <c language="csharp">blueprint:&lt;id&gt;</c> with a non-empty id.
    /// </summary>
    /// <param name="owner">The owner.</param>
    /// <returns><see langword="true"/> for a valid owner.</returns>
    public static bool IsValidOwner(string? owner) =>
        owner is not null &&
        (owner == UserOwner ||
         (owner.StartsWith(BlueprintOwnerPrefix, StringComparison.Ordinal) && owner.Length > BlueprintOwnerPrefix.Length && owner.Trim() == owner));

    /// <summary>
    /// Whether a package-relative pack path is <c language="csharp">sampleData/&lt;name&gt;.json</c> without <c language="csharp">..</c>, backslashes or empty segments.
    /// </summary>
    /// <param name="path">The path.</param>
    /// <returns><see langword="true"/> for a valid path.</returns>
    public static bool IsValidPath(string? path)
    {
        if (path is null)
        {
            return false;
        }

        return path.StartsWith(PathPrefix, StringComparison.Ordinal) &&
            path.EndsWith(PathSuffix, StringComparison.Ordinal) &&
            path.Length > PathPrefix.Length + PathSuffix.Length &&
            !path.Contains("..", StringComparison.Ordinal) &&
            !path.Contains('\\') &&
            !path.Contains("//", StringComparison.Ordinal);
    }

    [GeneratedRegex("^[a-z0-9]+([._-][a-z0-9]+)*$", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex IdPattern();

    [GeneratedRegex("^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex LocalePattern();
}
