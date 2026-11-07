// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Screen, ScreenTemplate } from '@cratis/scene.model';
import { EffectiveShell } from './EffectiveShell';
import { ShellDiagnostic } from './ShellDiagnostic';
import { ShellDiagnosticCode } from './ShellDiagnosticCode';
import { ShellSlotAction } from './ShellSlotAction';
import { SlotRemap, SlotRemaps, ShellSlotMove, ShellSwitchPlan } from './ShellSwitchPlan';
import { slotsUsedBy } from './resolveEffectiveShell';

const contentSlot = 'content';
const namedScreens = 3;

/** The codes that stop a switch: the candidate cannot be an application's shell, whatever the screens do. */
const blocking = new Set<ShellDiagnosticCode>([
    ShellDiagnosticCode.RootTemplateUnknown,
    ShellDiagnosticCode.RootTemplateVersionNotSatisfied,
    ShellDiagnosticCode.RootTemplateNotApplicable,
    ShellDiagnosticCode.RootTemplateMissingContentSlot,
    ShellDiagnosticCode.RootTemplateCycle,
]);

/**
 * Plans switching the application's shell: where the content of every slot of the current shell goes in the new one, what would be
 * lost, and what stops the switch. The pre-flight of "Use this shell"; the host shows the plan, offers the choices of any unresolved
 * slot, and on commit applies it as one undoable edit. The C# twin is `ShellSwitchPlanner.Plan`; both are asserted against `shell-switch-fixtures.json`.
 *
 * The default mapping is by name, with the current shell's primary slot following to the new shell's primary slot (a slot named
 * `content` does too when the new shell has no slot of that name). A slot the new shell lacks that screens place content in must be
 * decided - *move into the primary slot*, *map to another slot* or *drop* - through `remaps`, keyed by the slot's name; until then it is
 * `unresolved` and a blocker. A choice for a slot that needs none is ignored. A slot no screen uses needs no decision.
 *
 * @param current The shell in place, from `resolveEffectiveShell`.
 * @param candidate The shell being switched to, resolved the same way with the candidate as the profile's root.
 * @param screens The application's screens.
 * @param templates The screen templates a screen can be built from (`placeableScreenTemplates`).
 * @param remaps The user's choices for the slots that need one.
 * @returns The plan; `canSwitch` says whether it can be committed.
 */
export function planShellSwitch(
    current: EffectiveShell,
    candidate: EffectiveShell,
    screens: readonly Screen[],
    templates: readonly ScreenTemplate[] = [],
    remaps: SlotRemaps = {},
): ShellSwitchPlan {
    const users = new Map<string, string[]>();
    const used: string[] = [];
    for (const screen of screens) {
        for (const slot of slotsUsedBy(screen, current.name, templates)) {
            const names = users.get(slot) ?? [];
            if (!names.includes(screen.name)) names.push(screen.name);
            users.set(slot, names);
            if (!used.includes(slot)) used.push(slot);
        }
    }

    const blockers: ShellDiagnostic[] = [];
    const slots = [...current.slots, ...used.filter(slot => !current.slots.includes(slot))];
    const moves = slots.map(slot => moveOf(slot, current, candidate, users.get(slot) ?? [], remaps[slot], blockers));

    const addPackages: string[] = [];
    const warnings: ShellDiagnostic[] = [];
    for (const diagnostic of candidate.diagnostics) {
        if (diagnostic.code === ShellDiagnosticCode.ProfileSlotUnplaced) continue;
        if (diagnostic.code === ShellDiagnosticCode.RootTemplateBlueprintNotInstalled) {
            if (candidate.package !== undefined && !addPackages.includes(candidate.package)) addPackages.push(candidate.package);
        } else if (blocking.has(diagnostic.code)) {
            blockers.unshift(diagnostic);
        } else {
            warnings.push(diagnostic);
        }
    }

    return {
        from: current.name,
        to: candidate.name,
        fromPrimary: current.primarySlot,
        toPrimary: candidate.primarySlot,
        isNoOp: current.name === candidate.name && current.package === candidate.package,
        moves,
        addPackages,
        blockers,
        warnings,
        canSwitch: blockers.length === 0,
    };
}

function moveOf(slot: string, current: EffectiveShell, candidate: EffectiveShell, screens: string[], remap: SlotRemap | undefined, blockers: ShellDiagnostic[]): ShellSlotMove {
    const move = (action: ShellSlotAction, target: string | undefined, description: string): ShellSlotMove =>
        target === undefined ? { slot, action, screens, description } : { slot, action, target, screens, description };

    if (current.slots.includes(slot) && slot === current.primarySlot) {
        return candidate.primarySlot === slot
            ? move(ShellSlotAction.Keep, slot, keepText(slot, screens))
            : move(ShellSlotAction.Primary, candidate.primarySlot, primaryText(slot, candidate, screens));
    }

    if (candidate.slots.includes(slot)) return move(ShellSlotAction.Keep, slot, keepText(slot, screens));
    if (slot === contentSlot && current.slots.includes(slot)) return move(ShellSlotAction.Primary, candidate.primarySlot, primaryText(slot, candidate, screens));
    if (screens.length === 0) return move(ShellSlotAction.Unused, undefined, `Slot '${slot}' of shell '${current.name}' has no counterpart in shell '${candidate.name}'; no screen uses it`);

    return remapped(slot, candidate, screens, remap, blockers);
}

function remapped(slot: string, candidate: EffectiveShell, screens: string[], remap: SlotRemap | undefined, blockers: ShellDiagnostic[]): ShellSlotMove {
    const who = screensText(screens);
    const place = screens.length === 1 ? 'places' : 'place';
    const choices: SlotRemap[] = [
        { action: ShellSlotAction.MoveToPrimary, target: candidate.primarySlot },
        ...candidate.slots.filter(name => name !== candidate.primarySlot).map((name): SlotRemap => ({ action: ShellSlotAction.MapTo, target: name })),
        { action: ShellSlotAction.Drop },
    ];
    const decided = (action: ShellSlotAction, target: string | undefined, description: string): ShellSlotMove =>
        target === undefined ? { slot, action, screens, description } : { slot, action, target, screens, description };

    if (remap?.action === ShellSlotAction.MoveToPrimary) {
        return decided(ShellSlotAction.MoveToPrimary, candidate.primarySlot, `The content that ${who.names} ${place} in slot '${slot}' moves into '${candidate.primarySlot}', the primary slot of shell '${candidate.name}'`);
    }

    if (remap?.action === ShellSlotAction.Drop) {
        return decided(ShellSlotAction.Drop, undefined, `The content that ${who.names} ${place} in slot '${slot}' is dropped`);
    }

    let message = `${who.count} (${who.names}) ${place} content in slot '${slot}', which shell '${candidate.name}' does not have: move it into '${candidate.primarySlot}', map it to another slot or drop it`;
    if (remap?.action === ShellSlotAction.MapTo) {
        if (remap.target !== undefined && candidate.slots.includes(remap.target)) {
            return decided(ShellSlotAction.MapTo, remap.target, `The content that ${who.names} ${place} in slot '${slot}' moves into '${remap.target}' of shell '${candidate.name}'`);
        }

        message = `The content in slot '${slot}' cannot be mapped to '${remap.target ?? ''}': shell '${candidate.name}' has no such slot`;
    }

    blockers.push({ code: ShellDiagnosticCode.ProfileSlotUnplaced, subject: slot, message });
    return { slot, action: ShellSlotAction.Unresolved, screens, description: message, choices };
}

function keepText(slot: string, screens: string[]): string {
    if (screens.length === 0) return `Slot '${slot}' is kept; no screen uses it`;
    const who = screensText(screens);
    return `${who.names} stay${screens.length === 1 ? 's' : ''} in slot '${slot}'`;
}

function primaryText(slot: string, candidate: EffectiveShell, screens: string[]): string {
    if (screens.length === 0) return `Slot '${slot}' becomes '${candidate.primarySlot}', the primary slot of shell '${candidate.name}'; no screen uses it`;
    const who = screensText(screens);
    return `${who.names} move${screens.length === 1 ? 's' : ''} from slot '${slot}' to '${candidate.primarySlot}', the primary slot of shell '${candidate.name}'`;
}

/** "Orders, Customers and Tickets", or "Orders, Customers, Tickets and 2 more". */
function screensText(screens: string[]): { count: string; names: string } {
    const count = `${screens.length} ${screens.length === 1 ? 'screen' : 'screens'}`;
    const quoted = screens.map(name => `'${name}'`);
    if (screens.length <= namedScreens) {
        const head = quoted.slice(0, -1);
        return { count, names: head.length === 0 ? quoted[0] : `${head.join(', ')} and ${quoted[quoted.length - 1]}` };
    }

    return { count, names: `${quoted.slice(0, namedScreens).join(', ')} and ${screens.length - namedScreens} more` };
}
