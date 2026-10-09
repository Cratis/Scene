// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// One template as a template browser reads it: what it is, where it comes from, what it needs and whether the
/// active package set can use it.
/// </summary>
/// <param name="Package">The package that provides the template.</param>
/// <param name="PackageVersion">The version of that package.</param>
/// <param name="Kind">Which kind of template this is.</param>
/// <param name="Name">The template's name.</param>
/// <param name="DisplayName">A human-readable name for a template picker.</param>
/// <param name="Description">A one-line description for a template picker.</param>
/// <param name="Metadata">The template's semantic, compatibility, attribution and license metadata.</param>
/// <param name="Compatible">Whether the metadata is complete and every requirement is met.</param>
/// <param name="Problems">Why it is not.</param>
public record TemplateCatalogEntry(
    string Package,
    string PackageVersion,
    TemplateCatalogKind Kind,
    string Name,
    string? DisplayName,
    string? Description,
    TemplateMetadata? Metadata,
    bool Compatible,
    IReadOnlyList<string> Problems);
