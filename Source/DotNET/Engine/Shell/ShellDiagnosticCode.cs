// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// The engine-owned codes of the problems found while resolving an application's effective shell and checking the profile around it.
/// Their camelCase names (<c language="csharp">rootTemplateUnknown</c>, ...) are what every host, Screenplay and the editors show and map.
/// </summary>
public enum ShellDiagnosticCode
{
    /// <summary>
    /// The root template reference (or the legacy layout name) names a template that does not exist.
    /// </summary>
    RootTemplateUnknown = 0,

    /// <summary>
    /// The root template was chosen from a blueprint version that is not the one installed.
    /// </summary>
    RootTemplateVersionNotSatisfied = 1,

    /// <summary>
    /// The root template is not something an application can use as its shell (not a layout or root screen template at the Application scope).
    /// </summary>
    RootTemplateNotApplicable = 2,

    /// <summary>
    /// The root template has no slot for the screens' content.
    /// </summary>
    RootTemplateMissingContentSlot = 3,

    /// <summary>
    /// Templates that nest inside the shell contain each other, so they can never be placed.
    /// </summary>
    RootTemplateCycle = 4,

    /// <summary>
    /// The root template comes from a blueprint that is not installed (not in the profile's packages, or not available at all).
    /// </summary>
    RootTemplateBlueprintNotInstalled = 5,

    /// <summary>
    /// The profile's theme does not support every package of the profile.
    /// </summary>
    ProfileThemeIncompatible = 6,

    /// <summary>
    /// The profile names a package that is not available.
    /// </summary>
    ProfilePackageMissing = 7,

    /// <summary>
    /// A screen puts content in an outlet the shell does not have.
    /// </summary>
    ProfileSlotUnplaced = 8
}
