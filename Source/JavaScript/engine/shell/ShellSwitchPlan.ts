// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ShellDiagnostic } from './ShellDiagnostic';
import { ShellOutletAction } from './ShellOutletAction';

/** What the user chose to do with the content of an outlet the new shell does not have. */
export interface OutletRemap {
    /** `moveToPrimary`, `mapTo` or `drop`. */
    action: ShellOutletAction.MoveToPrimary | ShellOutletAction.MapTo | ShellOutletAction.Drop;

    /** For `mapTo`: the outlet of the new shell to move the content into. */
    target?: string;
}

/** The user's choices, by the name of the outlet of the current shell they are for. */
export type OutletRemaps = Record<string, OutletRemap>;

/** One outlet of the current shell and where its content goes. */
export interface ShellOutletMove {
    /** The outlet of the current shell. */
    outlet: string;

    /** What happens to its content. */
    action: ShellOutletAction;

    /** The outlet of the new shell the content lands in. Absent when it is dropped or not decided. */
    target?: string;

    /** The screens that place content in the outlet, in document order. */
    screens: string[];

    /** A sentence with the real names of the screens, outlets and shells, ready to show. */
    description: string;

    /** For an `unresolved` outlet: the choices on offer, *move into the primary outlet* first, then each other outlet, then *drop*. */
    choices?: OutletRemap[];
}

/** What switching the application's shell does. Pure data: the host applies it as one undoable edit. */
export interface ShellSwitchPlan {
    /** The name of the current shell. */
    from: string;

    /** The name of the shell being switched to. */
    to: string;

    /** The current shell's primary outlet. */
    fromPrimary: string;

    /** The new shell's primary outlet. */
    toPrimary: string;

    /** Whether nothing changes: the same shell, so every outlet stays. */
    isNoOp: boolean;

    /** Every outlet of the current shell (and any outlet screens use that it lacks), in declared order. */
    moves: ShellOutletMove[];

    /** Packages the switch adds to the profile: the new shell's blueprint when it is not yet among the profile's packages. */
    addPackages: string[];

    /** What stops the switch, with the engine code and a message with real names. Empty when the switch can be made. */
    blockers: ShellDiagnostic[];

    /** Problems the switch does not cause or cannot fix but the user should see (an incompatible theme, a missing package). */
    warnings: ShellDiagnostic[];

    /** Whether there are no blockers. */
    canSwitch: boolean;
}
