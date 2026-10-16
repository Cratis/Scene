// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Why a profile cannot be applied. The camelCase names are what every host shows and maps.
/// </summary>
public enum ProfileBlockerCode
{
    /// <summary>A package depends on another that is not available.</summary>
    MissingDependency = 0,

    /// <summary>A package depends on a version of another that is not the one available.</summary>
    VersionConflict = 1,

    /// <summary>Packages depend on each other in a circle.</summary>
    DependencyCycle = 2,

    /// <summary>The theme is not marked compatible with a package the profile uses.</summary>
    ThemeIncompatible = 3,

    /// <summary>The screen template new screens start from exists nowhere.</summary>
    DefaultScreenTemplateUnavailable = 4,

    /// <summary>A screen uses a layout the profile's packages no longer provide.</summary>
    UsedLayoutUnavailable = 5,

    /// <summary>A screen uses a screen template the profile's packages no longer provide.</summary>
    UsedScreenTemplateUnavailable = 6,

    /// <summary>A screen uses a dialog template the profile's packages no longer provide.</summary>
    UsedDialogTemplateUnavailable = 7,

    /// <summary>A screen uses a slot its layout or template no longer has.</summary>
    UsedSlotUnavailable = 8,

    /// <summary>The shell cannot be the application's shell. The shell's own code is in <see cref="ProfileBlocker.ShellCode"/>.</summary>
    ShellUnusable = 9
}
