// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// One sample-data pack a blueprint ships, as the gallery's preview-data selector lists it.
/// </summary>
/// <param name="Id">The pack's id.</param>
/// <param name="Title">The pack's display name.</param>
/// <param name="Locale">The BCP 47 locale tag of the data.</param>
/// <param name="Path">The package-relative path of the pack file.</param>
/// <param name="Default">Whether this is the pack a preview starts with.</param>
public record BlueprintCatalogSampleData(string Id, string Title, string Locale, string Path, bool Default);
