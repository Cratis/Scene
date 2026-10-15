// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.SampleData;

/// <summary>
/// How a <see cref="Packages.ScenePackage"/> declares a sample-data pack it ships: the pack's identity, enough
/// to list it in a selector without loading it, and where its JSON file lives.
/// </summary>
/// <param name="Id">The pack's identity; must equal the id inside the file.</param>
/// <param name="Title">The display name shown in a selector.</param>
/// <param name="Locale">The BCP 47 locale tag of the pack's data.</param>
/// <param name="Path">The package-relative path of the pack file, under <c language="csharp">sampleData/</c> and ending in <c language="csharp">.json</c>.</param>
public record SampleDataPackReference(string Id, string Title, string Locale, string Path);
