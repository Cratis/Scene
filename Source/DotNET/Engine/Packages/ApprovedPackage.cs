// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Packages;

namespace Cratis.Scene.Engine.Packages;

/// <summary>
/// One package a host approved: what a <c language="csharp">ui profile</c> can name it as, and where its runtime comes from.
/// </summary>
/// <param name="Manifest">The package declaration planning resolves a profile against - without loading any code.</param>
/// <param name="Module">Where the package's runtime bundle is imported from.</param>
public record ApprovedPackage(ScenePackage Manifest, PackageModuleReference Module);
