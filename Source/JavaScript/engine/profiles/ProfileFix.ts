// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What a one-click fix does. */
export enum ProfileFixKind {
    /** Adds a package, with what it needs. */
    AddPackage = 'addPackage',

    /** Drops the author's accent so the theme's own is used. */
    UseThemeAccent = 'useThemeAccent',

    /** Drops the own shell so the default blueprint is the shell. */
    UseDefaultBlueprint = 'useDefaultBlueprint',

    /** Makes the logo initials. */
    UseInitials = 'useInitials',

    /** Sets the menu mode to Drawer. */
    SwitchToDrawer = 'switchToDrawer',
}

/** One undoable edit a host can offer for a problem. Applying it is `applyProfileFix`; a host never edits the profile itself. */
export interface ProfileFix {
    kind: ProfileFixKind;

    /** The label of the button. */
    label: string;

    /** For `addPackage`: the package to add. */
    package?: string;
}
