// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneDocument, SceneElement, Screen, ScreenTemplate, TemplateRole } from '@cratis/scene.model';
import { ShellSlotAction } from './ShellSlotAction';
import { ShellSlotMove, ShellSwitchPlan } from './ShellSwitchPlan';
import { ShellSwitchApplication, ShellSwitchChange, ShellSwitchChangeKind } from './ShellSwitchApplication';
import { templatePlacement } from './resolveEffectiveShell';

/**
 * Applies a shell switch plan to a document: the content each screen placed in a slot of the current shell moves to the slot the plan
 * names in the new one, dropped content is removed, kept slots are untouched - and a screen template that fits a moved slot fits the
 * new slot instead, so the screens built from it move with it. A pure function: the document given is never changed. The C# twin is
 * `ShellSwitchApplier.Apply`; both are asserted against `shell-switch-apply-fixtures.json`.
 *
 * - Content moved into a slot is appended after what the slot already holds, in the order of the slots it came from. Kept slots come first in the screen's
 *   `slotContent`, then the slots the move created.
 * - A screen built from a screen template has no content of its own in a shell slot; its template's `fitsSlot` is rewritten (a name qualified with the
 *   current shell's name is requalified with the new shell's). A *dropped* slot leaves the template without a `fitsSlot`: placed explicitly, not by declaration.
 * - Only the document's own screens and templates are edited; a template that lives in an installed blueprint is not the application's to edit.
 * - A screen's `layout` is not touched.
 * - A plan with blockers is not applied.
 *
 * @param document The document to apply the plan to - for Studio, each saved document in turn.
 * @param plan The plan from {@link planShellSwitch}, with every slot that needed a decision decided.
 * @param templates The screen templates a screen can be built from ({@link placeableScreenTemplates}); defaults to the document's own, without the root templates.
 * @returns The document after the switch and what changed.
 */
export function applyShellSwitch(document: SceneDocument, plan: ShellSwitchPlan, templates?: readonly ScreenTemplate[]): ShellSwitchApplication {
    if (!plan.canSwitch) return { document, applied: false, changes: [] };

    const placeable = templates ?? document.screenTemplates.filter(template => template.metadata?.role !== TemplateRole.Root);
    const moves = new Map<string, ShellSlotMove>(plan.moves.map(move => [move.slot, move]));
    const changes: ShellSwitchChange[] = [];

    const screens = document.screens.map(screen => screen.screenTemplate === undefined ? withContentMoved(screen, moves, changes) : screen);
    const screenTemplates = document.screenTemplates.map(template => withPlacementMoved(template, plan, moves, placeable, changes));

    return {
        document: changes.length === 0 ? document : { ...document, screens, screenTemplates },
        applied: true,
        changes,
    };
}

function movesContent(move: ShellSlotMove | undefined): boolean {
    return move !== undefined && (move.action === ShellSlotAction.Primary || move.action === ShellSlotAction.MoveToPrimary || move.action === ShellSlotAction.MapTo || move.action === ShellSlotAction.Drop);
}

function withContentMoved(screen: Screen, moves: Map<string, ShellSlotMove>, changes: ShellSwitchChange[]): Screen {
    const entries = Object.entries(screen.slotContent ?? {});
    if (!entries.some(([slot]) => movesContent(moves.get(slot)))) return screen;

    const kept: Record<string, SceneElement[]> = {};
    const arrived: Record<string, SceneElement[]> = {};
    for (const [slot, content] of entries) {
        const move = moves.get(slot);
        if (move === undefined || !movesContent(move)) {
            kept[slot] = content;
            continue;
        }

        if (content.length === 0) continue;
        const elements = `${content.length} ${content.length === 1 ? 'element' : 'elements'}`;
        if (move.action === ShellSlotAction.Drop || move.target === undefined) {
            changes.push({ kind: ShellSwitchChangeKind.Content, screen: screen.name, slot, action: ShellSlotAction.Drop, count: content.length, description: `The ${elements} of '${screen.name}' in slot '${slot}' ${content.length === 1 ? 'is' : 'are'} dropped` });
            continue;
        }

        (arrived[move.target] ??= []).push(...content);
        changes.push({ kind: ShellSwitchChangeKind.Content, screen: screen.name, slot, action: move.action, target: move.target, count: content.length, description: `The ${elements} of '${screen.name}' in slot '${slot}' move${content.length === 1 ? 's' : ''} into '${move.target}'` });
    }

    const slotContent: Record<string, SceneElement[]> = { ...kept };
    for (const [slot, content] of Object.entries(arrived)) {
        slotContent[slot] = [...(slotContent[slot] ?? []), ...content];
    }

    return { ...screen, slotContent };
}

function withPlacementMoved(template: ScreenTemplate, plan: ShellSwitchPlan, moves: Map<string, ShellSlotMove>, templates: readonly ScreenTemplate[], changes: ShellSwitchChange[]): ScreenTemplate {
    if (template.metadata?.role === TemplateRole.Root || template.fitsSlot === undefined) return template;
    const placement = templatePlacement(template.name, plan.from, templates);
    if (placement === undefined || placement.template !== template.name) return template;
    const move = moves.get(placement.slot);
    if (move === undefined) return template;
    const moving = movesContent(move);
    if (!moving && move.action !== ShellSlotAction.Keep) return template;

    const qualify = (slot: string): string => placement.qualifier === undefined ? slot : `${placement.qualifier === plan.from ? plan.to : placement.qualifier}.${slot}`;

    if (move.action === ShellSlotAction.Drop) {
        const { fitsSlot, ...unplaced } = template;
        changes.push({ kind: ShellSwitchChangeKind.Placement, template: template.name, slot: placement.slot, action: move.action, count: 1, description: `'${template.name}' no longer fits slot '${placement.slot}': it is placed explicitly` });
        return unplaced;
    }

    const target = moving ? move.target ?? placement.slot : placement.slot;
    const fitsSlot = qualify(target);
    if (fitsSlot === template.fitsSlot) return template;
    const sentence = target === placement.slot ? `'${template.name}' stays in slot '${target}' of shell '${plan.to}'` : `'${template.name}' moves from slot '${placement.slot}' to '${target}'`;
    changes.push({ kind: ShellSwitchChangeKind.Placement, template: template.name, slot: placement.slot, action: move.action, target, count: 1, description: sentence });
    return { ...template, fitsSlot };
}
