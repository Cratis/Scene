// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { inspectOutletActions, outletChainOf, type OutletLevel } from '@cratis/scene.engine';
import { outletOfElement } from '@cratis/scene.react';
import { Opens, OutletKind, type SceneElement, type Screen, type ScreenFit } from '@cratis/scene.model';
import { actionSlicesOf, slotsOfScreen } from '../previewOutlets';
import type { PreviewScene } from '../PreviewScene';
import { isCoreComponent } from '../coreComponentNamed';

// One button of a toolbar that issues a slice: the screen it is on, the outlet it sits in, and where it opens the slice.
export interface IssuingHook {
    // The name of the screen the hook is on, and of the slice that owns that screen when a slice does.
    screen: string;
    owner?: string;

    // The outlet the hook sits in, and the id of the element that draws the outlet, which is what the editor selects.
    outlet: string;
    outletElementId?: string;

    // The hook's title and id.
    button: string;
    buttonId: string;

    // Where it opens: a dialog, a drawer, a slot, or none - it runs the slice directly.
    opens?: Opens;

    // Set when the hook is an action on the page rather than a button of an outlet: the outlet is then the slot it sits in, and the element is the action itself.
    action?: boolean;
}

// What the UI side says about one State Change slice: whether it has a screen of its own and what that fits, and every hook that issues it. It is
// read from the screens as Scene resolves them, so the board and the editor can say it without a rule of their own.
export interface SliceIssuance {
    // The slice, by the dotted path of names the scene knows it by.
    slice: string;
    screenless: boolean;
    screen?: string;
    fits: ScreenFit[];

    // How the slice's own screen opens, as the first hook that opens it resolves it.
    opens?: Opens;
    issuedFrom: IssuingHook[];
}

type Nested = SceneElement & { componentName?: string; slots?: Record<string, readonly SceneElement[]> };

// The outlets the elements draw, by name, with the element that draws each.
const collectDrawn = (elements: readonly SceneElement[] | undefined, drawn: Map<string, SceneElement>) => {
    for (const element of elements ?? []) {
        const nested = element as Nested;
        const name = element.properties?.name;
        if (isCoreComponent(nested.componentName, 'outletItems') && typeof name === 'string' && !drawn.has(name)) drawn.set(name, element);
        for (const children of Object.values(nested.slots ?? {})) collectDrawn(children, drawn);
    }
};

// The outlets a screen draws: its own content, and the content of the templates its levels are.
const drawnBy = (scene: PreviewScene, screen: Screen, chain: readonly OutletLevel[]): Map<string, SceneElement> => {
    const drawn = new Map<string, SceneElement>();
    for (const elements of Object.values(screen.slotContent ?? {})) collectDrawn(elements, drawn);
    for (const level of chain) {
        const template = scene.screenTemplates.find(candidate => candidate.name === level.name);
        for (const elements of Object.values(template?.content ?? {})) collectDrawn(elements, drawn);
    }

    return drawn;
};

// The actions a screen's own content draws, with the slot each sits in and the commands it runs - one for an action, every alternative of a guarded one.
interface DrawnAction {
    slot: string;
    element: SceneElement;
    commands: string[];
}

const commandsOf = (element: Nested): string[] => {
    const properties = (element.properties ?? {}) as { command?: unknown; alternatives?: unknown };
    if (isCoreComponent(element.componentName, 'action')) return typeof properties.command === 'string' ? [properties.command] : [];
    if (isCoreComponent(element.componentName, 'guarded-action') && Array.isArray(properties.alternatives)) {
        return properties.alternatives.flatMap(alternative => typeof (alternative as { command?: unknown })?.command === 'string' ? [(alternative as { command: string }).command] : []);
    }
    return [];
};

const collectActions = (slot: string, elements: readonly SceneElement[] | undefined, actions: DrawnAction[]) => {
    for (const element of elements ?? []) {
        const nested = element as Nested;
        const commands = commandsOf(nested);
        if (commands.length > 0) actions.push({ slot, element, commands: [...new Set(commands)] });
        for (const children of Object.values(nested.slots ?? {})) collectActions(slot, children, actions);
    }
};

const actionsOf = (screen: Screen): DrawnAction[] => {
    const actions: DrawnAction[] = [];
    for (const [slot, elements] of Object.entries(screen.slotContent ?? {})) collectActions(slot, elements, actions);
    return actions;
};

const titleOf = (element: SceneElement, command: string): string => {
    const label = element.properties?.label;
    return typeof label === 'string' && label.length > 0 ? label : command.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/ ([A-Z])/g, (_, letter: string) => ` ${letter.toLowerCase()}`);
};

// An outlet of actions a button could be added to: the screen it is drawn on, the slice that owns that screen, and the element that draws the outlet.
export interface ButtonTarget {
    screen: string;
    owner: string;
    outlet: string;
    outletElementId: string;
}

// The outlets of actions of the screens a slice owns - the only ones the board can open in the editor - each once per screen. A button added to one of them, naming a
// slice, is a hook that issues that slice.
export function buttonTargetsOf(scene: PreviewScene): ButtonTarget[] {
    const source = { layouts: scene.layouts, screenTemplates: scene.screenTemplates, screens: scene.screens, ...(scene.navigation ? { navigation: scene.navigation } : {}) };
    const targets: ButtonTarget[] = [];
    for (const screen of scene.screens) {
        if (!screen.owner) continue;
        const { chain, contributors } = outletChainOf(source, screen.name);
        for (const [name, element] of drawnBy(scene, screen, chain)) {
            if (outletOfElement(element.id, element.properties, { chain, contributors })?.kind !== OutletKind.Actions) continue;
            targets.push({ screen: screen.name, owner: screen.owner, outlet: name, outletElementId: element.id });
        }
    }
    return targets;
}

// Who issues each State Change slice of the scene: every hook of an outlet of actions, on every screen that draws the outlet, that names the slice, and every action
// on a page that runs the slice's command. The hooks are
// worked out by Scene's own resolver - the same one the preview and the application use - so a hook that opens a dialog, a drawer, a slot or runs the slice directly is
// what the application does.
export function sliceIssuanceOf(scene: PreviewScene): Map<string, SliceIssuance> {
    const slices = actionSlicesOf(scene);
    const issuance = new Map<string, SliceIssuance>(slices.map(slice => [slice.id, {
        slice: slice.id,
        screenless: slice.screen === undefined,
        ...(slice.screen === undefined ? {} : { screen: slice.screen }),
        fits: [...(slice.fits ?? [])],
        issuedFrom: [],
    }]));
    const source = { layouts: scene.layouts, screenTemplates: scene.screenTemplates, screens: scene.screens, ...(scene.navigation ? { navigation: scene.navigation } : {}) };

    for (const screen of scene.screens) {
        const { chain, contributors } = outletChainOf(source, screen.name);
        const drawn = drawnBy(scene, screen, chain);
        for (const [name, element] of drawn) {
            // As the outlet resolves when it is drawn: from the levels of the screen, else from what the element itself declares.
            const outlet = outletOfElement(element.id, element.properties, { chain, contributors });
            if (outlet?.kind !== OutletKind.Actions) continue;
            for (const inspection of inspectOutletActions(outlet, { slices, slots: slotsOfScreen(scene, screen), selected: false })) {
                const target = inspection.slice === undefined ? undefined : issuance.get(inspection.slice);
                if (!target) continue;
                const opens = inspection.placement?.resolved;
                target.issuedFrom.push({
                    screen: screen.name,
                    ...(screen.owner ? { owner: screen.owner } : {}),
                    outlet: name,
                    outletElementId: element.id,
                    button: inspection.title,
                    buttonId: inspection.id,
                    ...(opens === undefined ? {} : { opens }),
                });
            }
        }
    }

    // An action on a page runs its slice's command, so it issues that slice too - except on the slice's own screen, where the action is what submits it.
    const byCommand = new Map<string, string[]>();
    for (const slice of slices) if (slice.command) byCommand.set(slice.command, [...(byCommand.get(slice.command) ?? []), slice.id]);
    for (const screen of scene.screens) {
        for (const { slot, element, commands } of actionsOf(screen)) {
            for (const command of commands) {
                for (const slice of byCommand.get(command) ?? []) {
                    if (screen.owner === slice) continue;
                    issuance.get(slice)?.issuedFrom.push({
                        screen: screen.name,
                        ...(screen.owner ? { owner: screen.owner } : {}),
                        outlet: slot,
                        outletElementId: element.id,
                        button: titleOf(element, command),
                        buttonId: element.id,
                        action: true,
                    });
                }
            }
        }
    }

    for (const entry of issuance.values()) {
        entry.opens = entry.issuedFrom.map(hook => hook.opens).find(opens => opens !== undefined && opens !== Opens.None);
        if (entry.opens === undefined) delete entry.opens;
    }

    return issuance;
}
