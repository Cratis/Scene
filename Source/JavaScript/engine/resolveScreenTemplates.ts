// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Layout, ScreenTemplate } from '@cratis/scene.model';

/**
 * Where one {@link ScreenTemplate} ended up: the slot it declared, and the layout or template that turned
 * out to declare that slot.
 */
export interface ScreenTemplatePlacement {
    /** The template being placed. */
    template: string;
    /** The slot name the template declared it fits. */
    slot: string;
    /** The name of the {@link Layout} or {@link ScreenTemplate} declaring that slot. */
    container: string;
    /** How far below the layout the template sits — 1 directly inside the layout, 2 inside a template that is. */
    depth: number;
}

/**
 * A template that names a slot, where the set of containers in scope does not agree on exactly one home for
 * it.
 */
export interface UnplacedScreenTemplate {
    /** The template that could not be placed. */
    template: string;
    /** The slot name it declared it fits. */
    slot: string;
    /**
     * The containers declaring a slot of that name. Empty when nothing declares it; more than one when the
     * name is ambiguous. Never exactly one — that case is a {@link ScreenTemplatePlacement} instead.
     */
    candidates: string[];
}

/**
 * The outcome of working out how a blueprint's templates nest inside its layout.
 */
export interface ScreenTemplateResolution {
    /** Every template that found exactly one home, ordered shallowest first so a caller can build the tree top-down. */
    placements: ScreenTemplatePlacement[];
    /**
     * Templates that found none or several. Reported rather than guessed: placing a template in the wrong
     * parent renders content in the wrong region, which is far harder to diagnose than being told the slot
     * name is ambiguous.
     */
    unplaced: UnplacedScreenTemplate[];
    /** Template nesting cycles — a template that transitively contains itself. */
    cycles: string[][];
}

/**
 * Whether every template found exactly one home and nothing nests inside itself.
 */
export function isScreenTemplateResolutionValid(resolution: ScreenTemplateResolution): boolean {
    return resolution.unplaced.length === 0 && resolution.cycles.length === 0;
}

/**
 * Works out how a blueprint's {@link ScreenTemplate}s nest inside its {@link Layout}.
 *
 * A template declares only the *name* of the slot it fits, never which container owns that slot. That is
 * what makes templates reusable — a feature's template says "I go in the module content area", not "I go
 * inside this specific module". Resolution is the step that turns those names into a tree, by finding which
 * layout or template declares each name.
 *
 * The same rule applies at every level, so nesting has no depth limit and no separate mechanism per level.
 * The C# twin in `Cratis.Scene.Engine` implements the same algorithm; both are asserted against the same
 * shared fixture corpus so they cannot drift apart.
 */
export function resolveScreenTemplates(layout: Layout, templates: ScreenTemplate[]): ScreenTemplateResolution {
    const containersBySlot = buildSlotIndex(layout, templates);
    const parents = new Map<string, string>();
    const slots = new Map<string, string>();
    const unplaced: UnplacedScreenTemplate[] = [];

    for (const template of templates) {
        if (template.fitsSlot === undefined) continue;

        const [qualifier, slot] = splitQualifiedSlot(template.fitsSlot);

        const candidates = (containersBySlot.get(slot) ?? []).filter(
            (container) => container !== template.name && (qualifier === undefined || container === qualifier)
        );

        if (candidates.length === 1) {
            parents.set(template.name, candidates[0]);
            slots.set(template.name, slot);
        } else {
            unplaced.push({ template: template.name, slot: template.fitsSlot, candidates });
        }
    }

    const cycles = findCycles(parents);
    const inCycle = new Set(cycles.flat());

    const placements: ScreenTemplatePlacement[] = [];
    for (const template of templates) {
        const container = parents.get(template.name);
        if (container === undefined || inCycle.has(template.name)) continue;

        placements.push({
            template: template.name,
            slot: slots.get(template.name)!,
            container,
            depth: depthOf(template.name, parents, layout.name),
        });
    }

    placements.sort((left, right) => left.depth - right.depth || left.template.localeCompare(right.template));

    return { placements, unplaced, cycles };
}

/**
 * Splits a `fitsSlot` into the container it names and the slot within it.
 *
 * The same rule component names use: a bare name searches, a qualified one goes straight to what it names.
 * A slot called `body` is a good name at every level of a nesting chain, so several templates legitimately
 * declare one — and a bare `body` then has no single answer. Qualifying it says which, without forcing
 * every slot in an application to carry a unique name.
 */
function splitQualifiedSlot(fitsSlot: string): [string | undefined, string] {
    const lastDot = fitsSlot.lastIndexOf('.');
    return lastDot < 0 ? [undefined, fitsSlot] : [fitsSlot.substring(0, lastDot), fitsSlot.substring(lastDot + 1)];
}

function buildSlotIndex(layout: Layout, templates: ScreenTemplate[]): Map<string, string[]> {
    const index = new Map<string, string[]>();

    const declare = (slot: string, container: string) => {
        const containers = index.get(slot) ?? [];
        if (!containers.includes(container)) containers.push(container);
        index.set(slot, containers);
    };

    for (const slot of layout.slots) declare(slot.name, layout.name);
    for (const template of templates) {
        for (const slot of template.slots) declare(slot.name, template.name);
    }

    return index;
}

function findCycles(parents: Map<string, string>): string[][] {
    const cycles: string[][] = [];
    const recorded = new Set<string>();

    for (const start of [...parents.keys()].sort()) {
        const path: string[] = [];
        const onPath = new Set<string>();
        let current = start;

        for (;;) {
            const parent = parents.get(current);
            if (parent === undefined) break;

            path.push(current);
            onPath.add(current);
            if (onPath.has(parent)) {
                const cycle = path.slice(path.indexOf(parent));
                const key = [...cycle].sort().join(' ');
                if (!recorded.has(key)) {
                    recorded.add(key);
                    cycles.push(cycle);
                }

                break;
            }

            onPath.add(parent);
            current = parent;
        }
    }

    return cycles;
}

function depthOf(template: string, parents: Map<string, string>, layoutName: string): number {
    let depth = 0;
    let current = template;
    while (parents.has(current) && depth <= parents.size) {
        depth++;
        const parent = parents.get(current)!;
        if (parent === layoutName) break;
        current = parent;
    }

    return depth;
}
