// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Packages;

/// <summary>
/// What a domain blueprint declares about itself beyond what every package does: the business domain it serves, how it is described
/// in a gallery, and the ready-to-use screens it brings with their navigation.
/// </summary>
/// <remarks>
/// A blueprint's own version is <see cref="ScenePackage.Version"/>: there is deliberately no second version here to drift from it.
/// That version is what a template reference pins and what "update available" compares. Its sample-data packs are
/// <see cref="ScenePackage.SampleData"/>; <see cref="DefaultSampleData"/> chooses among them.
/// </remarks>
/// <param name="Domain">The business domain, as a lower-case slug (<c language="csharp">crm</c>, <c language="csharp">project-tracker</c>). Templates of the blueprint are categorised under <c language="csharp">Business / &lt;domain&gt;</c>.</param>
/// <param name="Description">One sentence, up to 200 characters, saying what the blueprint gives an application. Shown under the thumbnail in a gallery.</param>
/// <param name="Thumbnail">The package-relative path of the gallery thumbnail, <c language="csharp">thumbnails/&lt;name&gt;.png</c>, <c language="csharp">.webp</c>, <c language="csharp">.jpg</c> or <c language="csharp">.svg</c>. Design-time only and never part of a runtime bundle.</param>
/// <param name="ScreenSet">The ready-to-use screens, in navigation order.</param>
/// <param name="DefaultSampleData">The id of the sample-data pack a gallery preview and a new application start with; one of the package's sample-data ids. Required when the package ships more than one.</param>
public record BlueprintMetadata(
    string Domain,
    string Description,
    string Thumbnail,
    IReadOnlyList<BlueprintScreen> ScreenSet,
    string? DefaultSampleData = null);
