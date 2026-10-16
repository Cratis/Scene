// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Screen, ScreenTemplate } from '@cratis/scene.model';
import { EffectiveShell } from './EffectiveShell';
import { ShellDiagnostic } from './ShellDiagnostic';
import { ShellDiagnosticCode } from './ShellDiagnosticCode';
import { ShellOutletAction } from './ShellOutletAction';
import { OutletRemap, OutletRemaps, ShellOutletMove, ShellSwitchPlan } from './ShellSwitchPlan';
import { outletsUsedBy } from './resolveEffectiveShell';

const contentOutlet = 'content';
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
 * Plans switching the application's shell: where the content of every outlet of the current shell goes in the new one, what would be
 * lost, and what stops the switch. The pre-flight of "Use this shell"; the host shows the plan, offers the choices of any unresolved
 * outlet, and on commit applies it as one undoable edit. The C# twin is `ShellSwitchPlanner.Plan`; both are asserted against `shell-switch-fixtures.json`.
 *
 * The default mapping is by name, with the current shell's primary outlet following to the new shell's primary outlet (an outlet named
 * `content` does too when the new shell has no outlet of that name). An outlet the new shell lacks that screens place content in must be
 * decided - *move into the primary outlet*, *map to another outlet* or *drop* - through `remaps`, keyed by the outlet's name; until then it is
 * `unresolved` and a blocker. A choice for an outlet that needs none is ignored. An outlet no screen uses needs no decision.
 *
 * @param current The shell in place, from `resolveEffectiveShell`.
 * @param candidate The shell being switched to, resolved the same way with the candidate as the profile's root.
 * @param screens The application's screens.
 * @param templates The screen templates a screen can be built from (`placeableScreenTemplates`).
 * @param remaps The user's choices for the outlets that need one.
 * @returns The plan; `canSwitch` says whether it can be committed.
 */
export function planShellSwitch(
    current: EffectiveShell,
    candidate: EffectiveShell,
    screens: readonly Screen[],
    templates: readonly ScreenTemplate[] = [],
    remaps: OutletRemaps = {},
): ShellSwitchPlan {
    const users = new Map<string, string[]>();
    const used: string[] = [];
    for (const screen of screens) {
        for (const outlet of outletsUsedBy(screen, current.name, templates)) {
            const names = users.get(outlet) ?? [];
            if (!names.includes(screen.name)) names.push(screen.name);
            users.set(outlet, names);
            if (!used.includes(outlet)) used.push(outlet);
        }
    }

    const blockers: ShellDiagnostic[] = [];
    const outlets = [...current.outlets, ...used.filter(outlet => !current.outlets.includes(outlet))];
    const moves = outlets.map(outlet => moveOf(outlet, current, candidate, users.get(outlet) ?? [], remaps[outlet], blockers));

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
        fromPrimary: current.primaryOutlet,
        toPrimary: candidate.primaryOutlet,
        isNoOp: current.name === candidate.name && current.package === candidate.package,
        moves,
        addPackages,
        blockers,
        warnings,
        canSwitch: blockers.length === 0,
    };
}

function moveOf(outlet: string, current: EffectiveShell, candidate: EffectiveShell, screens: string[], remap: OutletRemap | undefined, blockers: ShellDiagnostic[]): ShellOutletMove {
    const move = (action: ShellOutletAction, target: string | undefined, description: string): ShellOutletMove =>
        target === undefined ? { outlet, action, screens, description } : { outlet, action, target, screens, description };

    if (current.outlets.includes(outlet) && outlet === current.primaryOutlet) {
        return candidate.primaryOutlet === outlet
            ? move(ShellOutletAction.Keep, outlet, keepText(outlet, screens))
            : move(ShellOutletAction.Primary, candidate.primaryOutlet, primaryText(outlet, candidate, screens));
    }

    if (candidate.outlets.includes(outlet)) return move(ShellOutletAction.Keep, outlet, keepText(outlet, screens));
    if (outlet === contentOutlet && current.outlets.includes(outlet)) return move(ShellOutletAction.Primary, candidate.primaryOutlet, primaryText(outlet, candidate, screens));
    if (screens.length === 0) return move(ShellOutletAction.Unused, undefined, `Outlet '${outlet}' of shell '${current.name}' has no counterpart in shell '${candidate.name}'; no screen uses it`);

    return remapped(outlet, candidate, screens, remap, blockers);
}

function remapped(outlet: string, candidate: EffectiveShell, screens: string[], remap: OutletRemap | undefined, blockers: ShellDiagnostic[]): ShellOutletMove {
    const who = screensText(screens);
    const place = screens.length === 1 ? 'places' : 'place';
    const choices: OutletRemap[] = [
        { action: ShellOutletAction.MoveToPrimary, target: candidate.primaryOutlet },
        ...candidate.outlets.filter(name => name !== candidate.primaryOutlet).map((name): OutletRemap => ({ action: ShellOutletAction.MapTo, target: name })),
        { action: ShellOutletAction.Drop },
    ];
    const decided = (action: ShellOutletAction, target: string | undefined, description: string): ShellOutletMove =>
        target === undefined ? { outlet, action, screens, description } : { outlet, action, target, screens, description };

    if (remap?.action === ShellOutletAction.MoveToPrimary) {
        return decided(ShellOutletAction.MoveToPrimary, candidate.primaryOutlet, `The content that ${who.names} ${place} in outlet '${outlet}' moves into '${candidate.primaryOutlet}', the primary outlet of shell '${candidate.name}'`);
    }

    if (remap?.action === ShellOutletAction.Drop) {
        return decided(ShellOutletAction.Drop, undefined, `The content that ${who.names} ${place} in outlet '${outlet}' is dropped`);
    }

    let message = `${who.count} (${who.names}) ${place} content in outlet '${outlet}', which shell '${candidate.name}' does not have: move it into '${candidate.primaryOutlet}', map it to another outlet or drop it`;
    if (remap?.action === ShellOutletAction.MapTo) {
        if (remap.target !== undefined && candidate.outlets.includes(remap.target)) {
            return decided(ShellOutletAction.MapTo, remap.target, `The content that ${who.names} ${place} in outlet '${outlet}' moves into '${remap.target}' of shell '${candidate.name}'`);
        }

        message = `The content in outlet '${outlet}' cannot be mapped to '${remap.target ?? ''}': shell '${candidate.name}' has no such outlet`;
    }

    blockers.push({ code: ShellDiagnosticCode.ProfileSlotUnplaced, subject: outlet, message });
    return { outlet, action: ShellOutletAction.Unresolved, screens, description: message, choices };
}

function keepText(outlet: string, screens: string[]): string {
    if (screens.length === 0) return `Outlet '${outlet}' is kept; no screen uses it`;
    const who = screensText(screens);
    return `${who.names} stay${screens.length === 1 ? 's' : ''} in outlet '${outlet}'`;
}

function primaryText(outlet: string, candidate: EffectiveShell, screens: string[]): string {
    if (screens.length === 0) return `Outlet '${outlet}' becomes '${candidate.primaryOutlet}', the primary outlet of shell '${candidate.name}'; no screen uses it`;
    const who = screensText(screens);
    return `${who.names} move${screens.length === 1 ? 's' : ''} from outlet '${outlet}' to '${candidate.primaryOutlet}', the primary outlet of shell '${candidate.name}'`;
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
