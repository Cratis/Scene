// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The identity a shell draws: every fallback applied, so a blueprint never decides one itself.
/// </summary>
/// <param name="Name">The application name; empty when neither the profile nor the host gave one.</param>
/// <param name="ShowName">Whether the name is drawn beside the mark.</param>
/// <param name="Kind">The mark that is drawn. An icon or image that cannot be used resolves to initials, except a missing image, which stays an image so it is drawn as an empty box.</param>
/// <param name="Initials">The one or two characters of an initials mark; always set, so a fallback has something to draw.</param>
/// <param name="Icon">The icon of an icon mark.</param>
/// <param name="Image">The image of an image mark, as the data URI that was stored.</param>
/// <param name="ImageMissing">Whether the logo is an image logo that has no usable image: valid to store, a profile problem, drawn as a dashed box.</param>
/// <param name="Diagnostics">Everything that was refused.</param>
public record ResolvedProfileIdentity(
    string Name,
    bool ShowName,
    LogoKind Kind,
    string Initials,
    string? Icon,
    string? Image,
    bool ImageMissing,
    IReadOnlyList<ProfileIdentityDiagnostic> Diagnostics);
