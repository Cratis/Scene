// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Packages;

/// <summary>
/// Platform-neutral names of optional design-time extension points a package provides.
/// </summary>
/// <param name="Previews">Named component preview renderers available in the package's design-time bundle.</param>
/// <param name="Designers">Named full-component designers available in the package's design-time bundle.</param>
/// <param name="PropertyEditors">Named property editors available in the package's design-time bundle.</param>
/// <param name="PropertyDisplays">Named property display renderers available in the package's design-time bundle.</param>
/// <param name="Actions">Named design-time action handlers available in the package's design-time bundle.</param>
/// <param name="ContractVersion">
/// The design-time extension contract version (<c language="csharp">major.minor</c>) the bundle was written against. Hosts load
/// contributions only when the major version matches the one they implement; <see langword="null"/> means <c language="csharp">1.0</c>.
/// </param>
public record PackageDesignTimeMetadata(
    IReadOnlyList<string> Previews,
    IReadOnlyList<string> Designers,
    IReadOnlyList<string> PropertyEditors,
    IReadOnlyList<string> PropertyDisplays,
    IReadOnlyList<string> Actions,
    string? ContractVersion = null);
