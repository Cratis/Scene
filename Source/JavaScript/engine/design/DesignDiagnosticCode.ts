// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What can be wrong with the way a design system is selected and resolved. The codes are camelCase and engine-owned. */
export enum DesignDiagnosticCode {
    /** The profile names a theme the design system and the packages do not have; the default theme is used. */
    ThemeNotFound = 'themeNotFound',

    /** The theme has no values for the mode the profile asks for; the theme is drawn without them. */
    ModeNotImplemented = 'modeNotImplemented',

    /** The profile asks for a colour scheme the design system does not declare as a mode; its first mode is used. */
    ModeNotDeclared = 'modeNotDeclared',

    /** A component part refers to a token role the theme gives no value in the mode; the part is left out. */
    TokenUnresolved = 'tokenUnresolved',
}
