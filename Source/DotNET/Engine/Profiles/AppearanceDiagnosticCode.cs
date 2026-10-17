// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// What can be wrong with the appearance of a profile. Serialized in camelCase.
/// </summary>
public enum AppearanceDiagnosticCode
{
    /// <summary>
    /// The font is not in the catalog or not available to the host; the system font is used.
    /// </summary>
    FontUnavailable = 0,

    /// <summary>
    /// The accent is not a hex colour; the theme's accent is kept.
    /// </summary>
    AccentInvalid = 1,

    /// <summary>
    /// The theme is a dark theme under a light scheme or the other way round; the theme is applied as chosen.
    /// </summary>
    ThemeSchemeMismatch = 2
}
