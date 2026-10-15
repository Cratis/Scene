// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// One declared dependency of a blueprint.
/// </summary>
/// <param name="Name">The package depended on.</param>
/// <param name="VersionRange">The range of versions accepted.</param>
public record BlueprintCatalogDependency(string Name, string? VersionRange = null);
