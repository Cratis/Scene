// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Packages;

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// Which Scene and package versions a template was authored and verified against.
/// </summary>
/// <param name="Scene">The Scene model version range the template requires, such as <c language="csharp">^4.13.0</c>.</param>
/// <param name="Packages">The packages, and their version ranges, whose components or layouts the template uses.</param>
public record TemplateCompatibility(string Scene, IReadOnlyList<PackageDependency>? Packages = null);
