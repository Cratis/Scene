// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

using Cratis.Scene.Model.Structure;

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// Semantic and browsing metadata. Category is required for blueprint templates and recommended for own templates. Type and category are open strings so packages can
/// introduce their own vocabulary without a Scene release. Category never determines applicability.
/// </summary>
/// <param name="Type">Semantic role: ApplicationShell, Workspace, List, Detail, Form, Dialog or a custom string.</param>
/// <param name="Category">A package-defined browse category, preserved even when a host does not recognize it.</param>
/// <param name="Scopes">Explicit scope restriction. Null uses the structural role; an empty list allows no scope.</param>
/// <param name="Compatibility">The Scene and package versions the template requires. Required for every shipped template.</param>
/// <param name="Attribution">Who authored the template. Required for every shipped template.</param>
/// <param name="License">The SPDX license identifier the template is available under. Required for every shipped template.</param>
/// <param name="LicenseUrl">An absolute <c language="csharp">https</c> URL to the license terms.</param>
/// <param name="SliceKinds">
/// For a template that applies at <see cref="TemplateScope.Slice"/>, the slice kinds it applies to. Null uses the
/// structural default: a dialog template applies to state change slices, a screen template to every kind that presents something.
/// Declaring slice kinds without scopes makes the default scope <see cref="TemplateScope.Slice"/>.
/// </param>
/// <param name="Thumbnail">The package-relative path of the template's gallery thumbnail (<c language="csharp">thumbnails/&lt;name&gt;.png|webp|jpg|svg</c>); required of every template of a domain blueprint.</param>
/// <param name="Role">A structural role beyond the template's kind. <see cref="TemplateRole.Root"/> marks a screen template that can be an application's shell.</param>
/// <param name="PrimaryOutlet">For a shell: the name of the slot every screen's content is placed in. <see langword="null"/> means <c language="csharp">content</c>.</param>
/// <param name="DefaultMenuMode">For a shell: the navigation mode the application starts in when the shell is chosen; the author can change it afterwards.</param>
/// <param name="DisplayName">For a shell offered as a card: its title. Falls back to the template's name.</param>
/// <param name="Description">For a shell offered as a card: its one-line description.</param>
[method: JsonConstructor]
public record TemplateMetadata(
    string? Type = null,
    string? Category = null,
    IReadOnlyList<TemplateScope>? Scopes = null,
    TemplateCompatibility? Compatibility = null,
    TemplateAttribution? Attribution = null,
    string? License = null,
    string? LicenseUrl = null,
    IReadOnlyList<SliceKind>? SliceKinds = null,
    string? Thumbnail = null,
    TemplateRole? Role = null,
    string? PrimaryOutlet = null,
    string? DefaultMenuMode = null,
    string? DisplayName = null,
    string? Description = null)
{
    /// <summary>
    /// Initializes a new instance of the <see cref="TemplateMetadata"/> record with the members it had before the default menu mode, title and description.
    /// Kept so a package compiled against an earlier version still finds the constructor it was built with.
    /// </summary>
    /// <param name="type">The template's type.</param>
    /// <param name="category">The gallery category.</param>
    /// <param name="scopes">The scopes the template can be used at.</param>
    /// <param name="compatibility">The versions it is compatible with.</param>
    /// <param name="attribution">Who made it.</param>
    /// <param name="license">The license.</param>
    /// <param name="licenseUrl">Where the license text is.</param>
    /// <param name="sliceKinds">The slice kinds it can host.</param>
    /// <param name="thumbnail">The gallery thumbnail.</param>
    /// <param name="role">A structural role.</param>
    /// <param name="primaryOutlet">For a shell: the slot content is placed in.</param>
    public TemplateMetadata(
        string? type,
        string? category,
        IReadOnlyList<TemplateScope>? scopes,
        TemplateCompatibility? compatibility,
        TemplateAttribution? attribution,
        string? license,
        string? licenseUrl,
        IReadOnlyList<SliceKind>? sliceKinds,
        string? thumbnail,
        TemplateRole? role,
        string? primaryOutlet)
        : this(type, category, scopes, compatibility, attribution, license, licenseUrl, sliceKinds, thumbnail, role, primaryOutlet, null, null, null)
    {
    }
}
