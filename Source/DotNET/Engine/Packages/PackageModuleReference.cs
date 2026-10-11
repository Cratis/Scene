// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Packages;

/// <summary>
/// Where the runtime of an approved package comes from: the npm package a frontend build installs, and the
/// export of that package which is its <c language="typescript">ScenePackageBundle</c>.
/// </summary>
/// <param name="Npm">The npm package name the frontend build installs and imports, for example <c language="json">@acme/scene.charts</c>.</param>
/// <param name="Version">The npm version or range written into the application's <c language="json">package.json</c>.</param>
/// <param name="Export">The named export of <paramref name="Npm"/> that is the package's runtime bundle.</param>
/// <param name="Styles">Package-relative style sheets the application imports for the package, such as <c language="json">@acme/scene.charts/styles.css</c>. Never URLs.</param>
public record PackageModuleReference(string Npm, string Version, string Export, IReadOnlyList<string> Styles);
