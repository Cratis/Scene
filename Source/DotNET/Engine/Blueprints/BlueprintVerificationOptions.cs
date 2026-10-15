// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// How a blueprint is verified.
/// </summary>
/// <param name="FoundationPackage">The package that provides the foundation set a domain blueprint must depend on. Null uses <see cref="BlueprintRules.FoundationPackageName"/>.</param>
/// <param name="RequireBlueprintMetadata">Whether a package without blueprint metadata is a problem. Set for every domain blueprint; unset for a package that only provides foundation layouts and templates.</param>
public record BlueprintVerificationOptions(string? FoundationPackage = null, bool RequireBlueprintMetadata = false);
