// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Icons;

/// <summary>
/// What a <see cref="Packages.ScenePackage"/> of kind <see cref="Packages.PackageKind.IconLibrary"/>
/// declares about its icons, beyond what every package declares. The icons themselves are not listed: the
/// catalog - an <see cref="IconEntry"/> per icon - is loaded on demand from the library's module, and each
/// icon's artwork is loaded per icon by the renderer's adapter.
/// </summary>
/// <param name="Variants">The style variants the library offers, empty when it has a single style.</param>
/// <param name="Renderers">The renderers the library ships an adapter for (<c language="csharp">react</c> ...).</param>
/// <param name="Attribution">The credit line the library's license asks to be shown.</param>
/// <param name="AttributionUrl">Where the attribution points - the library's home or license page.</param>
/// <param name="IconCount">How many icons the catalog holds, for a picker to show before the catalog is loaded.</param>
public record IconLibrary(
    IReadOnlyList<string> Variants,
    IReadOnlyList<string> Renderers,
    string? Attribution = null,
    string? AttributionUrl = null,
    int? IconCount = null);
