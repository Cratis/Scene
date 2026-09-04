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
/// <param name="Layouts">The names of the <see cref="Layouts.Layout"/>s this package provides - an application's base navigational shells. Empty for anything that is not a <see cref="PackageKind.Blueprint"/>.</param>
/// <param name="ScreenTemplates">The names of the <see cref="Screens.ScreenTemplate"/>s this package provides - the shapes that go inside a layout, at module, feature and slice level.</param>
/// <param name="DialogTemplates">The names of the <see cref="Screens.DialogTemplate"/>s this package provides.</param>
/// <param name="Themes">The names of the <see cref="Profiles.Theme"/>s this package ships, empty for a package that ships none.</param>
/// <param name="DisplayName">A human-readable name for a package picker, falling back to <paramref name="Name"/> when absent.</param>
/// <param name="Description">A one-line description for a package picker.</param>
/// <param name="Module">
/// The module that implements the package - an npm package name for a web renderer. Design-time tooling
/// needs it to know what to import; the model itself never loads anything.
/// </param>
/// <param name="License">
/// The license the package is available under, as a short human-readable name (<c>MIT</c>,
/// <c>PrimeUI Community</c>). A package picker shows it, because "what am I taking on by selecting this"
/// is a question an author needs answered before they select it, not after.
/// </param>
/// <param name="LicenseUrl">
/// Where the license terms actually live, so a reader can go and check rather than take
/// <paramref name="License"/> on trust. Required in practice for anything that is not a permissive
/// standard license - a name alone tells an author nothing about eligibility or obligations.
/// </param>
public record ScenePackage(
    string Name,
    string Version,
    PackageKind Kind,
    IReadOnlyList<PackageDependency> Dependencies,
    IReadOnlyList<string> Components,
    IReadOnlyList<string> Layouts,
    IReadOnlyList<string> ScreenTemplates,
    IReadOnlyList<string> DialogTemplates,
    IReadOnlyList<string> Themes,
    string? DisplayName = null,
    string? Description = null,
    string? Module = null,
    string? License = null,
    string? LicenseUrl = null);
