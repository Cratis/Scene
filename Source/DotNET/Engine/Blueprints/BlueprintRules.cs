// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.RegularExpressions;

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// The rules a domain blueprint is held to that are about the shape of a value.
/// </summary>
public static partial class BlueprintRules
{
    /// <summary>
    /// The name of the package that provides the foundation layouts and templates every domain blueprint builds on.
    /// </summary>
    public const string FoundationPackageName = "Cratis.Blueprint.Default";

    /// <summary>
    /// The prefix every template category of a domain blueprint starts with; the rest is the domain.
    /// </summary>
    public const string BusinessCategoryPrefix = "Business / ";

    /// <summary>
    /// The longest a blueprint description may be.
    /// </summary>
    public const int MaximumDescriptionLength = 200;

    /// <summary>
    /// The template types a domain blueprint may declare.
    /// </summary>
    public static readonly IReadOnlyList<string> TemplateTypes = ["Shell", "Workspace", "Dashboard", "List", "Board", "Detail", "Form", "Wizard", "Dialog", "Auth", "State", "Calendar", "Timeline", "Inbox", "Settings", "Profile", "Report", "Import"];

    /// <summary>
    /// Whether a value is a lower-case domain slug: <c language="csharp">crm</c>, <c language="csharp">project-tracker</c>.
    /// </summary>
    /// <param name="domain">The value.</param>
    /// <returns><see langword="true"/> when valid.</returns>
    public static bool IsValidDomain(string? domain) => domain is not null && DomainPattern().IsMatch(domain);

    /// <summary>
    /// Whether a value is a package-relative thumbnail path: <c language="csharp">thumbnails/&lt;name&gt;.png</c>, <c language="csharp">.webp</c>, <c language="csharp">.jpg</c> or <c language="csharp">.svg</c>.
    /// </summary>
    /// <param name="path">The value.</param>
    /// <returns><see langword="true"/> when valid.</returns>
    public static bool IsValidThumbnailPath(string? path) => path is not null && ThumbnailPattern().IsMatch(path);

    [GeneratedRegex("^[a-z][a-z0-9]*(-[a-z0-9]+)*$", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex DomainPattern();

    [GeneratedRegex("^thumbnails/[A-Za-z0-9][A-Za-z0-9._-]*\\.(png|webp|jpg|svg)$", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex ThumbnailPattern();
}
