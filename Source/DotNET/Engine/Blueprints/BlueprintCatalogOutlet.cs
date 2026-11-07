// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// One outlet a template offers, as the gallery lists it: "toolbar · actions · 2 defaults".
/// </summary>
/// <param name="Name">The name of the outlet, such as <c language="csharp">toolbar</c>.</param>
/// <param name="Kind">Its kind: <c language="csharp">actions</c>, <c language="csharp">filters</c>, <c language="csharp">tabs</c>, <c language="csharp">stats</c> or <c language="csharp">navigation</c>.</param>
/// <param name="Defaults">How many default items it declares.</param>
public record BlueprintCatalogOutlet(string Name, string Kind, int Defaults);
