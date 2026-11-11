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

interface ShellPair {
    current: EffectiveShell;
    candidate: EffectiveShell;
}

interface SlotUse {
    slot: string;
    screens: string[];
    remap: SlotRemap | undefined;
}

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
    const users = usersBySlot(screens, current, templates);
    const shells: ShellPair = { current, candidate };
    const blockers: ShellDiagnostic[] = [];
    const slots = [...current.slots, ...[...users.keys()].filter(slot => !current.slots.includes(slot))];
    const moves = slots.map(slot => moveOf({ slot, screens: users.get(slot) ?? [], remap: remaps[slot] }, shells, blockers));
    const { addPackages, warnings } = sortCandidateDiagnostics(candidate, blockers);

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

function usersBySlot(screens: readonly Screen[], current: EffectiveShell, templates: readonly ScreenTemplate[]): Map<string, string[]> {
    const users = new Map<string, string[]>();
    for (const screen of screens) {
        for (const slot of slotsUsedBy(screen, current.name, templates)) {
            const names = users.get(slot) ?? [];
            if (!names.includes(screen.name)) names.push(screen.name);
            users.set(slot, names);
        }
    }

    return users;
}

function sortCandidateDiagnostics(candidate: EffectiveShell, blockers: ShellDiagnostic[]): { addPackages: string[]; warnings: ShellDiagnostic[] } {
    const addPackages: string[] = [];
    const warnings: ShellDiagnostic[] = [];
    for (const diagnostic of candidate.diagnostics.filter(item => item.code !== ShellDiagnosticCode.ProfileSlotUnplaced)) {
        if (diagnostic.code === ShellDiagnosticCode.RootTemplateBlueprintNotInstalled) {
            addOnce(addPackages, candidate.package);
        } else if (blocking.has(diagnostic.code)) {
            blockers.unshift(diagnostic);
        } else {
            warnings.push(diagnostic);
        }
    }

    return { addPackages, warnings };
}

function addOnce(packages: string[], name: string | undefined): void {
    if (name !== undefined && !packages.includes(name)) packages.push(name);
}

function moveFor(use: SlotUse, action: ShellSlotAction, target: string | undefined, description: string): ShellSlotMove {
    const { slot, screens } = use;
    return target === undefined ? { slot, action, screens, description } : { slot, action, target, screens, description };
}

function moveOf(use: SlotUse, shells: ShellPair, blockers: ShellDiagnostic[]): ShellSlotMove {
    const { slot, screens } = use;
    const unused = `Slot '${slot}' of shell '${shells.current.name}' has no counterpart in shell '${shells.candidate.name}'; no screen uses it`;
    return defaultMove(use, shells)
        ?? (screens.length === 0 ? moveFor(use, ShellSlotAction.Unused, undefined, unused) : remapped(use, shells.candidate, blockers));
}

function defaultMove(use: SlotUse, { current, candidate }: ShellPair): ShellSlotMove | undefined {
    const { slot, screens } = use;
    const inCurrent = current.slots.includes(slot);
    const keep = (): ShellSlotMove => moveFor(use, ShellSlotAction.Keep, slot, keepText(slot, screens));
    const primary = (): ShellSlotMove => moveFor(use, ShellSlotAction.Primary, candidate.primarySlot, primaryText(slot, candidate, screens));

    if (inCurrent && slot === current.primarySlot) return candidate.primarySlot === slot ? keep() : primary();
    if (candidate.slots.includes(slot)) return keep();
    return slot === contentSlot && inCurrent ? primary() : undefined;
}

function remapped(use: SlotUse, candidate: EffectiveShell, blockers: ShellDiagnostic[]): ShellSlotMove {
    const { slot, screens, remap } = use;
    const decided = decidedMove(use, candidate);
    if (decided !== undefined) return decided;

    const who = screensText(screens);
    const message = remap?.action === ShellSlotAction.MapTo
        ? `The content in slot '${slot}' cannot be mapped to '${remap.target ?? ''}': shell '${candidate.name}' has no such slot`
        : `${who.count} (${who.names}) ${placeVerb(screens)} content in slot '${slot}', which shell '${candidate.name}' does not have: move it into '${candidate.primarySlot}', map it to another slot or drop it`;
    blockers.push({ code: ShellDiagnosticCode.ProfileSlotUnplaced, subject: slot, message });
    return { slot, action: ShellSlotAction.Unresolved, screens, description: message, choices: choicesFor(candidate) };
}

function decidedMove(use: SlotUse, candidate: EffectiveShell): ShellSlotMove | undefined {
    const { slot, screens, remap } = use;
    const content = `The content that ${screensText(screens).names} ${placeVerb(screens)} in slot '${slot}'`;
    switch (remap?.action) {
        case ShellSlotAction.MoveToPrimary:
            return moveFor(use, ShellSlotAction.MoveToPrimary, candidate.primarySlot, `${content} moves into '${candidate.primarySlot}', the primary slot of shell '${candidate.name}'`);
        case ShellSlotAction.Drop:
            return moveFor(use, ShellSlotAction.Drop, undefined, `${content} is dropped`);
        case ShellSlotAction.MapTo:
            return remap.target !== undefined && candidate.slots.includes(remap.target)
                ? moveFor(use, ShellSlotAction.MapTo, remap.target, `${content} moves into '${remap.target}' of shell '${candidate.name}'`)
                : undefined;
        default:
            return undefined;
    }
}

function choicesFor(candidate: EffectiveShell): SlotRemap[] {
    return [
        { action: ShellSlotAction.MoveToPrimary, target: candidate.primarySlot },
        ...candidate.slots.filter(name => name !== candidate.primarySlot).map((name): SlotRemap => ({ action: ShellSlotAction.MapTo, target: name })),
        { action: ShellSlotAction.Drop },
    ];
}

function placeVerb(screens: string[]): string {
    return screens.length === 1 ? 'places' : 'place';
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
