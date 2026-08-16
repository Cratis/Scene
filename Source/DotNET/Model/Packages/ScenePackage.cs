// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Packages;

/// <summary>
/// What a <see cref="Profiles.UiProfile"/>'s <see cref="Profiles.UiProfile.Packages"/> entry actually names.
/// A profile lists packages by name only; this is the declaration behind the name - what it contributes,
/// and what else has to be active for it to work.
/// </summary>
/// <param name="Name">The name a <see cref="Profiles.UiProfile"/> lists, and the name a <see cref="PackageDependency"/> refers to.</param>
/// <param name="Version">The package's own version, so a <see cref="PackageDependency.VersionRange"/> has something to check against.</param>
/// <param name="Kind">What the package contributes.</param>
/// <param name="Dependencies">Other packages that must be active in the same profile for this one to work.</param>
/// <param name="Components">The component names this package declares - the catalog entry <see cref="Profiles.UiProfile"/> resolution walks.</param>
/// <param name="Layouts">The names of the <see cref="Layouts.Layout"/>s this package provides, empty for a package that provides none.</param>
/// <param name="Themes">The names of the <see cref="Profiles.Theme"/>s this package ships, empty for a package that ships none.</param>
/// <param name="DisplayName">A human-readable name for a package picker, falling back to <paramref name="Name"/> when absent.</param>
/// <param name="Description">A one-line description for a package picker.</param>
/// <param name="Module">
/// The module that implements the package - an npm package name for a web renderer. Design-time tooling
/// needs it to know what to import; the model itself never loads anything.
/// </param>
public record ScenePackage(
    string Name,
    string Version,
    PackageKind Kind,
    IReadOnlyList<PackageDependency> Dependencies,
    IReadOnlyList<string> Components,
    IReadOnlyList<string> Layouts,
    IReadOnlyList<string> Themes,
    string? DisplayName = null,
    string? Description = null,
    string? Module = null);
