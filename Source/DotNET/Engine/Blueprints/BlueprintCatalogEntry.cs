// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// One domain blueprint as the gallery and the CLI documentation read it: what it is, how to show it, what it brings and what it needs.
/// This is the shape of an entry of <c language="csharp">blueprintCatalog.json</c>.
/// </summary>
/// <param name="Package">The package name.</param>
/// <param name="Version">The package version.</param>
/// <param name="Domain">The business domain.</param>
/// <param name="DisplayName">The name shown in the gallery.</param>
/// <param name="Description">One sentence saying what the blueprint gives an application.</param>
/// <param name="Thumbnail">The package-relative thumbnail path.</param>
/// <param name="License">The license name.</param>
/// <param name="LicenseUrl">Where the license terms live.</param>
/// <param name="Dependencies">The packages it depends on.</param>
/// <param name="Screens">The screen set in navigation order.</param>
/// <param name="Templates">The templates it provides.</param>
/// <param name="SampleData">The sample-data packs it ships.</param>
public record BlueprintCatalogEntry(
    string Package,
    string Version,
    string Domain,
    string? DisplayName,
    string Description,
    string Thumbnail,
    string? License,
    string? LicenseUrl,
    IReadOnlyList<BlueprintCatalogDependency> Dependencies,
    IReadOnlyList<BlueprintCatalogScreen> Screens,
    IReadOnlyList<BlueprintCatalogTemplate> Templates,
    IReadOnlyList<BlueprintCatalogSampleData> SampleData);
