// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// What can be wrong with the identity of a profile. Serialized in camelCase.
/// </summary>
public enum ProfileIdentityDiagnosticCode
{
    /// <summary>
    /// The initials are longer than two characters; they are not truncated, the mark falls back to the name.
    /// </summary>
    InitialsTooLong = 0,

    /// <summary>
    /// The icon is not in the closed set; the mark falls back to initials.
    /// </summary>
    IconUnknown = 1,

    /// <summary>
    /// The image is not a base64 data URI of a PNG, JPG, SVG or WebP; the logo draws as missing.
    /// </summary>
    ImageUnsupported = 2,

    /// <summary>
    /// The image is larger than the limit; the logo draws as missing.
    /// </summary>
    ImageTooLarge = 3
}
