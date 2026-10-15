// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// The selector's content: generated, the author's own sets, then blueprint groups.
/// </summary>
/// <param name="Generated">The <c language="csharp">Generic (typed by field kind)</c> entry.</param>
/// <param name="Own">The author's own data sets, in the order given.</param>
/// <param name="Blueprints">Blueprints that ship at least one pack, in package order.</param>
/// <param name="Problems">Problems found validating what the packages ship.</param>
public record SampleDataCatalog(
    SampleDataCatalogEntry Generated,
    IReadOnlyList<SampleDataCatalogEntry> Own,
    IReadOnlyList<SampleDataCatalogGroup> Blueprints,
    IReadOnlyList<string> Problems);
