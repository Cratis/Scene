// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ShellSlotAction, type EffectiveShell, type SlotRemap, type SlotRemaps, type ShellSwitchPlan } from '@cratis/scene.engine';

/** One slot of the shell in place that the new shell has no counterpart for, and the screens that put content in it. */
export interface RemapRow {
    slot: string;

    /** The names of the screens that place content in it. */
    screens: string[];

    /** What the author chose, absent until they do. */
    chosen?: SlotRemap;
}

/** The choices for any such slot: into the primary slot, into another slot of the new shell, or drop it. */
export function remapChoicesOf(candidate: EffectiveShell): SlotRemap[] {
    return [
        { action: ShellSlotAction.MoveToPrimary, target: candidate.primarySlot },
        ...candidate.slots.filter(name => name !== candidate.primarySlot).map(name => ({ action: ShellSlotAction.MapTo as const, target: name })),
        { action: ShellSlotAction.Drop },
    ];
}

/**
 * The slots the author has to decide about, which is the whole of the remap table: it is not shown when there are none. A slot whose content moves by
 * itself - same name, the primary slot, a slot no screen uses - is the plan's to explain, not a question.
 *
 * @param plan Scene's plan for the switch.
 * @param remaps What the author chose so far.
 * @returns A row per slot that needs a decision, in the order the plan lists them.
 */
export function remapRowsOf(plan: ShellSwitchPlan, remaps: SlotRemaps): RemapRow[] {
    return plan.moves
        .filter(move => move.action === ShellSlotAction.Unresolved || (remaps[move.slot] !== undefined && move.screens.length > 0 && move.choices === undefined && isDecided(move.action)))
        .map(move => ({ slot: move.slot, screens: move.screens, ...(remaps[move.slot] ? { chosen: remaps[move.slot] } : {}) }));
}

const isDecided = (action: ShellSlotAction): boolean => action === ShellSlotAction.MoveToPrimary || action === ShellSlotAction.MapTo || action === ShellSlotAction.Drop;

/** A choice as the value of a select. */
export const remapKey = (remap: SlotRemap | undefined): string => remap === undefined ? '' : remap.action === ShellSlotAction.MapTo ? `${remap.action}:${remap.target ?? ''}` : remap.action;

/** The choice a select value stands for. */
export function remapFromKey(key: string, choices: readonly SlotRemap[]): SlotRemap | undefined {
    return choices.find(choice => remapKey(choice) === key);
}
