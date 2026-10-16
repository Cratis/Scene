// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The engine-owned codes of the problems found while resolving an application's effective shell and checking the profile around
 * it. The values are the camelCase names every host, Screenplay and the editors show and map.
 */
export enum ShellDiagnosticCode {
    /** The root template reference (or the legacy layout name) names a template that does not exist. */
    RootTemplateUnknown = 'rootTemplateUnknown',

    /** The root template was chosen from a blueprint version that is not the one installed. */
    RootTemplateVersionNotSatisfied = 'rootTemplateVersionNotSatisfied',

    /** The root template is not something an application can use as its shell (not a layout or root screen template at the Application scope). */
    RootTemplateNotApplicable = 'rootTemplateNotApplicable',

    /** The root template has no slot for the screens' content. */
    RootTemplateMissingContentSlot = 'rootTemplateMissingContentSlot',

    /** Templates that nest inside the shell contain each other, so they can never be placed. */
    RootTemplateCycle = 'rootTemplateCycle',

    /** The root template comes from a blueprint that is not installed (not in the profile's packages, or not available at all). */
    RootTemplateBlueprintNotInstalled = 'rootTemplateBlueprintNotInstalled',

    /** The profile's theme does not support every package of the profile. */
    ProfileThemeIncompatible = 'profileThemeIncompatible',

    /** The profile names a package that is not available. */
    ProfilePackageMissing = 'profilePackageMissing',

    /** A screen puts content in an outlet the shell does not have. */
    ProfileSlotUnplaced = 'profileSlotUnplaced',
}
