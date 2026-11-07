// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ShellDiagnostic } from './ShellDiagnostic';
import { ShellSlotAction } from './ShellSlotAction';

/** What the user chose to do with the content of a slot the new shell does not have. */
export interface SlotRemap {
    /** `moveToPrimary`, `mapTo` or `drop`. */
    action: ShellSlotAction.MoveToPrimary | ShellSlotAction.MapTo | ShellSlotAction.Drop;

    /** For `mapTo`: the slot of the new shell to move the content into. */
    target?: string;
}

/** The user's choices, by the name of the slot of the current shell they are for. */
export type SlotRemaps = Record<string, SlotRemap>;

/** One slot of the current shell and where its content goes. */
export interface ShellSlotMove {
    /** The slot of the current shell. */
    slot: string;

    /** What happens to its content. */
    action: ShellSlotAction;

    /** The slot of the new shell the content lands in. Absent when it is dropped or not decided. */
    target?: string;

    /** The screens that place content in the slot, in document order. */
    screens: string[];

    /** A sentence with the real names of the screens, slots and shells, ready to show. */
    description: string;

    /** For an `unresolved` slot: the choices on offer, *move into the primary slot* first, then each other slot, then *drop*. */
    choices?: SlotRemap[];
}

/** What switching the application's shell does. Pure data: the host applies it as one undoable edit. */
export interface ShellSwitchPlan {
    /** The name of the current shell. */
    from: string;

    /** The name of the shell being switched to. */
    to: string;

    /** The current shell's primary slot. */
    fromPrimary: string;

    /** The new shell's primary slot. */
    toPrimary: string;

    /** Whether nothing changes: the same shell, so every slot stays. */
    isNoOp: boolean;

    /** Every slot of the current shell (and any slot screens use that it lacks), in declared order. */
    moves: ShellSlotMove[];

    /** Packages the switch adds to the profile: the new shell's blueprint when it is not yet among the profile's packages. */
    addPackages: string[];

    /** What stops the switch, with the engine code and a message with real names. Empty when the switch can be made. */
    blockers: ShellDiagnostic[];

    /** Problems the switch does not cause or cannot fix but the user should see (an incompatible theme, a missing package). */
    warnings: ShellDiagnostic[];

    /** Whether there are no blockers. */
    canSwitch: boolean;
}
