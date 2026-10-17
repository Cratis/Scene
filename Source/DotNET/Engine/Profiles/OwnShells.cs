// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.RegularExpressions;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Says what a valid value for "my own shell" is. The TypeScript twin is <c language="csharp">describeOwnShellValue</c>.
/// </summary>
public static partial class OwnShells
{
    /// <summary>
    /// Says what a valid value for "my own shell" is: a package name (<c language="csharp">@acme/shell</c>, <c language="csharp">acme-shell</c>) or a path
    /// (<c language="csharp">./shell</c>, <c language="csharp">../shells/main</c>, <c language="csharp">/opt/shell</c>). An empty value is reported - as the
    /// <see cref="ProfileBlockerCode.OwnShellHasNoValue"/> problem when it is chosen.
    /// </summary>
    /// <param name="value">What was entered.</param>
    /// <returns>Whether it is valid and what it is.</returns>
    public static OwnShellValue Describe(string? value)
    {
        var text = value?.Trim() ?? string.Empty;
        if (text.Length == 0)
        {
            return new OwnShellValue(false, null, "Enter a package name or a path");
        }

        if (PathPattern().IsMatch(text) && !text.Any(char.IsWhiteSpace))
        {
            return new OwnShellValue(true, OwnShellKind.Path, string.Empty);
        }

        return PackagePattern().IsMatch(text)
            ? new OwnShellValue(true, OwnShellKind.Package, string.Empty)
            : new OwnShellValue(false, null, $"'{text}' is neither a package name nor a path");
    }

    [GeneratedRegex(@"^(?:\.{1,2}/|/|~/)", RegexOptions.CultureInvariant, matchTimeoutMilliseconds: 1000)]
    private static partial Regex PathPattern();

    [GeneratedRegex(@"^(?:@[a-z0-9][a-z0-9._-]*/)?[a-z0-9][a-z0-9._-]*$", RegexOptions.CultureInvariant, matchTimeoutMilliseconds: 1000)]
    private static partial Regex PackagePattern();
}
