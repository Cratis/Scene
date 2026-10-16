// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What the migration of a legacy profile could not map. The camelCase values are what every host shows and maps. */
export enum ProfileMigrationDiagnosticCode {
    /** The legacy layout name is not a layout (or root template) of the application or of any available blueprint; the profile keeps it. */
    LegacyLayoutUnknown = 'legacyLayoutUnknown',

    /** The legacy shell names a blueprint that is not available. */
    LegacyShellNotInstalled = 'legacyShellNotInstalled',

    /** The legacy shell is available but provides no layout or root template an application can use as its shell. */
    LegacyShellHasNoLayout = 'legacyShellHasNoLayout',

    /** The legacy colour scheme is not Light, Dark or System. */
    LegacyColorSchemeUnknown = 'legacyColorSchemeUnknown',

    /** A navigation mode was set but the profile ends up with no root template to carry it. */
    LegacyNavigationModeWithoutRoot = 'legacyNavigationModeWithoutRoot',

    /** The legacy default screen template is not a screen template of the application or of any installed blueprint. */
    LegacyDefaultScreenTemplateUnknown = 'legacyDefaultScreenTemplateUnknown',
}
