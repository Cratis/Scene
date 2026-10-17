// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Profiles;

/// <summary>
/// The application's logo. Every member is kept even when the <paramref name="Kind"/> does not use it, so switching the type back shows what was entered before.
/// </summary>
/// <param name="Kind">How the logo is made, or <see langword="null"/> for initials.</param>
/// <param name="Initials">Up to two characters for the initials logo. Empty or <see langword="null"/> means the first letter of the name, upper-cased.</param>
/// <param name="Icon">One of the closed set of logo icons for the icon logo.</param>
/// <param name="Image">The image for the image logo as a <c language="csharp">data:</c> URI with base64 content (PNG, JPG, SVG or WebP, up to 400 KB of image data).</param>
public record ProfileLogo(
    LogoKind? Kind = null,
    string? Initials = null,
    string? Icon = null,
    string? Image = null);
