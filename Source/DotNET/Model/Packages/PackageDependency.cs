// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Packages;

/// <summary>
/// One package a <see cref="ScenePackage"/> needs present in the same <see cref="Profiles.UiProfile"/> to
/// work. <c>@cratis/components</c> is written against PrimeReact and Tailwind, so it declares both - a
/// profile listing it without them is stating something that cannot render, and that has to be visible
/// rather than discovered at runtime.
/// </summary>
/// <param name="Name">The name of the package depended on, matching that package's <see cref="ScenePackage.Name"/>.</param>
/// <param name="VersionRange">
/// An optional semver range the dependency must satisfy. Left <see langword="null"/> when any version
/// will do - which is the common case, since a profile only ever activates one version of a package.
/// </param>
public record PackageDependency(string Name, string? VersionRange = null);
