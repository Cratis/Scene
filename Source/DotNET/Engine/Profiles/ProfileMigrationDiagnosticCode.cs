// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// What the migration of a legacy profile could not map. The camelCase names (<c language="csharp">legacyLayoutUnknown</c>, ...) are what
/// every host shows and maps.
/// </summary>
public enum ProfileMigrationDiagnosticCode
{
    /// <summary>
    /// The legacy layout name is not a layout (or root template) of the application or of any available blueprint; the profile keeps it.
    /// </summary>
    LegacyLayoutUnknown = 0,

    /// <summary>
    /// The legacy shell names a blueprint that is not available.
    /// </summary>
    LegacyShellNotInstalled = 1,

    /// <summary>
    /// The legacy shell is available but provides no layout or root template an application can use as its shell.
    /// </summary>
    LegacyShellHasNoLayout = 2,

    /// <summary>
    /// The legacy colour scheme is not Light, Dark or System.
    /// </summary>
    LegacyColorSchemeUnknown = 3,

    /// <summary>
    /// A navigation mode was set but the profile ends up with no root template to carry it.
    /// </summary>
    LegacyNavigationModeWithoutRoot = 4,

    /// <summary>
    /// The legacy default screen template is not a screen template of the application or of any installed blueprint.
    /// </summary>
    LegacyDefaultScreenTemplateUnknown = 5
}
