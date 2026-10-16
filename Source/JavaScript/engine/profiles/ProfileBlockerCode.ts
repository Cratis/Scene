// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Why a profile cannot be applied. The camelCase values are what every host shows and maps. */
export enum ProfileBlockerCode {
    /** A package depends on another that is not available. */
    MissingDependency = 'missingDependency',

    /** A package depends on a version of another that is not the one available. */
    VersionConflict = 'versionConflict',

    /** Packages depend on each other in a circle. */
    DependencyCycle = 'dependencyCycle',

    /** The theme is not marked compatible with a package the profile uses. */
    ThemeIncompatible = 'themeIncompatible',

    /** The screen template new screens start from exists nowhere. */
    DefaultScreenTemplateUnavailable = 'defaultScreenTemplateUnavailable',

    /** A screen uses a layout the profile's packages no longer provide. */
    UsedLayoutUnavailable = 'usedLayoutUnavailable',

    /** A screen uses a screen template the profile's packages no longer provide. */
    UsedScreenTemplateUnavailable = 'usedScreenTemplateUnavailable',

    /** A screen uses a dialog template the profile's packages no longer provide. */
    UsedDialogTemplateUnavailable = 'usedDialogTemplateUnavailable',

    /** A screen uses a slot its layout or template no longer has. */
    UsedSlotUnavailable = 'usedSlotUnavailable',

    /** The shell cannot be the application's shell. The shell's own code is in `ProfileBlocker.shellCode`. */
    ShellUnusable = 'shellUnusable',
}
