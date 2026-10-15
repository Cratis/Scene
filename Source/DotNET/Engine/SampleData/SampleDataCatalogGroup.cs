// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// A blueprint's packs, one group of the Blueprints submenu.
/// </summary>
/// <param name="Blueprint">The blueprint's display name (<c language="csharp">CRM</c>).</param>
/// <param name="Packs">The blueprint's packs.</param>
public record SampleDataCatalogGroup(string Blueprint, IReadOnlyList<SampleDataCatalogEntry> Packs);
