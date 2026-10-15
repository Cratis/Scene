// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.SampleData;

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// A package and the sample-data packs it ships, loaded.
/// </summary>
/// <param name="Manifest">The package manifest; only its <c language="csharp">SampleData</c> references are used.</param>
/// <param name="Packs">The loaded packs the manifest's references point to.</param>
public record SampleDataPackSource(ScenePackage Manifest, IReadOnlyList<SampleDataPack>? Packs = null);
