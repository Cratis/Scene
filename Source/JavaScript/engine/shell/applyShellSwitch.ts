// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneDocument, SceneElement, Screen, ScreenTemplate, TemplateRole } from '@cratis/scene.model';
import { ShellOutletAction } from './ShellOutletAction';
import { ShellOutletMove, ShellSwitchPlan } from './ShellSwitchPlan';
import { ShellSwitchApplication, ShellSwitchChange, ShellSwitchChangeKind } from './ShellSwitchApplication';
import { templatePlacement } from './resolveEffectiveShell';

/**
 * Applies a shell switch plan to a document: the content each screen placed in an outlet of the current shell moves to the outlet the plan
 * names in the new one, dropped content is removed, kept outlets are untouched - and a screen template that fits a moved outlet fits the
 * new outlet instead, so the screens built from it move with it. A pure function: the document given is never changed. The C# twin is
 * `ShellSwitchApplier.Apply`; both are asserted against `shell-switch-apply-fixtures.json`.
 *
 * - Content moved into an outlet is appended after what the outlet already holds, in the order of the outlets it came from. Kept outlets come first in the screen's
 *   `slotContent`, then the outlets the move created.
 * - A screen built from a screen template has no content of its own in a shell outlet; its template's `fitsSlot` is rewritten (a name qualified with the
 *   current shell's name is requalified with the new shell's). A *dropped* outlet leaves the template without a `fitsSlot`: placed explicitly, not by declaration.
 * - Only the document's own screens and templates are edited; a template that lives in an installed blueprint is not the application's to edit.
 * - A screen's `layout` is not touched.
 * - A plan with blockers is not applied.
 *
 * @param document The document to apply the plan to - for Studio, each saved document in turn.
 * @param plan The plan from {@link planShellSwitch}, with every outlet that needed a decision decided.
 * @param templates The screen templates a screen can be built from ({@link placeableScreenTemplates}); defaults to the document's own, without the root templates.
 * @returns The document after the switch and what changed.
 */
export function applyShellSwitch(document: SceneDocument, plan: ShellSwitchPlan, templates?: readonly ScreenTemplate[]): ShellSwitchApplication {
    if (!plan.canSwitch) return { document, applied: false, changes: [] };

    const placeable = templates ?? document.screenTemplates.filter(template => template.metadata?.role !== TemplateRole.Root);
    const moves = new Map<string, ShellOutletMove>(plan.moves.map(move => [move.outlet, move]));
    const changes: ShellSwitchChange[] = [];

    const screens = document.screens.map(screen => screen.screenTemplate === undefined ? withContentMoved(screen, moves, changes) : screen);
    const screenTemplates = document.screenTemplates.map(template => withPlacementMoved(template, plan, moves, placeable, changes));

    return {
        document: changes.length === 0 ? document : { ...document, screens, screenTemplates },
        applied: true,
        changes,
    };
}

function movesContent(move: ShellOutletMove | undefined): boolean {
    return move !== undefined && (move.action === ShellOutletAction.Primary || move.action === ShellOutletAction.MoveToPrimary || move.action === ShellOutletAction.MapTo || move.action === ShellOutletAction.Drop);
}

function withContentMoved(screen: Screen, moves: Map<string, ShellOutletMove>, changes: ShellSwitchChange[]): Screen {
    const entries = Object.entries(screen.slotContent ?? {});
    if (!entries.some(([outlet]) => movesContent(moves.get(outlet)))) return screen;

    const kept: Record<string, SceneElement[]> = {};
    const arrived: Record<string, SceneElement[]> = {};
    for (const [outlet, content] of entries) {
        const move = moves.get(outlet);
        if (move === undefined || !movesContent(move)) {
            kept[outlet] = content;
            continue;
        }

        if (content.length === 0) continue;
        const elements = `${content.length} ${content.length === 1 ? 'element' : 'elements'}`;
        if (move.action === ShellOutletAction.Drop || move.target === undefined) {
            changes.push({ kind: ShellSwitchChangeKind.Content, screen: screen.name, outlet, action: ShellOutletAction.Drop, count: content.length, description: `The ${elements} of '${screen.name}' in outlet '${outlet}' ${content.length === 1 ? 'is' : 'are'} dropped` });
            continue;
        }

        (arrived[move.target] ??= []).push(...content);
        changes.push({ kind: ShellSwitchChangeKind.Content, screen: screen.name, outlet, action: move.action, target: move.target, count: content.length, description: `The ${elements} of '${screen.name}' in outlet '${outlet}' move${content.length === 1 ? 's' : ''} into '${move.target}'` });
    }

    const slotContent: Record<string, SceneElement[]> = { ...kept };
    for (const [outlet, content] of Object.entries(arrived)) {
        slotContent[outlet] = [...(slotContent[outlet] ?? []), ...content];
    }

    return { ...screen, slotContent };
}

function withPlacementMoved(template: ScreenTemplate, plan: ShellSwitchPlan, moves: Map<string, ShellOutletMove>, templates: readonly ScreenTemplate[], changes: ShellSwitchChange[]): ScreenTemplate {
    if (template.metadata?.role === TemplateRole.Root || template.fitsSlot === undefined) return template;
    const placement = templatePlacement(template.name, plan.from, templates);
    if (placement === undefined || placement.template !== template.name) return template;
    const move = moves.get(placement.outlet);
    if (move === undefined) return template;
    const moving = movesContent(move);
    if (!moving && move.action !== ShellOutletAction.Keep) return template;

    const qualify = (outlet: string): string => placement.qualifier === undefined ? outlet : `${placement.qualifier === plan.from ? plan.to : placement.qualifier}.${outlet}`;

    if (move.action === ShellOutletAction.Drop) {
        const { fitsSlot, ...unplaced } = template;
        changes.push({ kind: ShellSwitchChangeKind.Placement, template: template.name, outlet: placement.outlet, action: move.action, count: 1, description: `'${template.name}' no longer fits outlet '${placement.outlet}': it is placed explicitly` });
        return unplaced;
    }

    const target = moving ? move.target ?? placement.outlet : placement.outlet;
    const fitsSlot = qualify(target);
    if (fitsSlot === template.fitsSlot) return template;
    const sentence = target === placement.outlet ? `'${template.name}' stays in outlet '${target}' of shell '${plan.to}'` : `'${template.name}' moves from outlet '${placement.outlet}' to '${target}'`;
    changes.push({ kind: ShellSwitchChangeKind.Placement, template: template.name, outlet: placement.outlet, action: move.action, target, count: 1, description: sentence });
    return { ...template, fitsSlot };
}
