// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Outlet, OutletItem, OutletItemKind, OutletKind, OutletMode, OutletRefinement } from '@cratis/scene.model';
import { EffectiveOutlet } from './EffectiveOutlet';
import { EffectiveOutletItem } from './EffectiveOutletItem';
import { OutletDiagnostic } from './OutletDiagnostic';
import { outletDiagnostics } from './outletDiagnostics';
import { OutletItemSource } from './OutletItemSource';
import { groupItemKinds, outletItemKinds } from './outletItemKinds';
import { OutletLevel } from './OutletLevel';
import { OutletProvenance } from './OutletProvenance';
import { OutletRemoval } from './OutletRemoval';
import { RemovedOutletItem } from './RemovedOutletItem';

interface Resolution {
    outlet: string;
    kind: OutletKind;
    items: EffectiveOutletItem[];
    removed: RemovedOutletItem[];
    diagnostics: OutletDiagnostic[];

    /** The number of items the level being placed inherits; its own items never go above them. */
    floor: number;

    /** Hides that named no inherited item; they apply to the contributions once those are added. */
    pendingHides: { id: string; owner: string }[];
}

/**
 * Resolves an outlet for the last level of a chain. The first level that declares the outlet supplies its defaults; each
 * level below it inherits, extends (hiding some and adding its own after the inherited ones) or overrides (replacing the
 * inherited ones); then every contribution - from the chain and from the contributors - is added after all of those, as
 * contributions belong to someone else and overriding does not remove them. A level's own items never move above the ones
 * it inherits: `before` and `after` only order them among themselves, and `before` an inherited item puts it first after
 * the inherited ones. Contributions likewise only order among the contributions. A `hide` works on any item, including a
 * contributed one.
 * @remarks An item without `before` or `after` goes last.
 * @param chain The levels from the top down, such as layout, template, module, feature and screen; the last is the level the outlet is resolved for.
 * @param outlet The name of the outlet.
 * @param contributors Levels outside the chain that may contribute to the outlet, such as another feature.
 * @returns The resolved outlet, with provenance per item, what was hidden or overridden, a summary and diagnostics.
 */
export function effectiveOutlet(chain: OutletLevel[], outlet: string, contributors: OutletLevel[] = []): EffectiveOutlet {
    const declaringIndex = chain.findIndex(level => (level.outlets ?? []).some(candidate => candidate.name === outlet));
    if (declaringIndex < 0) {
        return { name: outlet, items: [], removed: [], sources: [], summary: '', diagnostics: [outletDiagnostics.unknownOutlet(outlet)] };
    }

    const last = chain.length - 1;
    const declaringLevel = chain[declaringIndex];
    const declaration = declaringLevel.outlets!.find(candidate => candidate.name === outlet)!;
    const resolution: Resolution = { outlet, kind: declaration.kind, items: [], removed: [], diagnostics: [], floor: 0, pendingHides: [] };
    checkDeclaration(declaration, declaringLevel.name, resolution.diagnostics);

    const sources = [declaringLevel.name];
    const defaults: OutletProvenance = { owner: declaringLevel.name, level: declaringLevel.kind, source: OutletItemSource.Default };
    for (const item of declaration.defaults ?? []) place(resolution, item, defaults, declaringIndex === last);

    const mode = refineDownTheChain(resolution, chain, declaringIndex, sources);

    resolution.floor = resolution.items.length;
    addContributions(resolution, [...chain, ...contributors], last, sources);
    hideContributions(resolution);

    const result: EffectiveOutlet = {
        name: outlet,
        kind: declaration.kind,
        declaredBy: declaringLevel.name,
        items: resolution.items,
        removed: resolution.removed,
        sources,
        summary: sources.join(' + '),
        diagnostics: resolution.diagnostics,
    };
    if (declaration.subject !== undefined) result.subject = declaration.subject;
    if (declaration.slot !== undefined) result.slot = declaration.slot;
    if (mode !== undefined) result.mode = mode;
    return result;
}

function refineDownTheChain(resolution: Resolution, chain: OutletLevel[], declaringIndex: number, sources: string[]): OutletMode | undefined {
    const last = chain.length - 1;
    let mode: OutletMode | undefined;
    for (let index = declaringIndex; index < chain.length; index++) {
        const level = chain[index];
        reportDuplicateDeclarations(resolution, level, index === declaringIndex, chain[declaringIndex].name);
        if (index === declaringIndex) continue;

        const levelMode = refineLevel(resolution, level, index === last);
        if (levelMode !== OutletMode.Inherits && !sources.includes(level.name)) sources.push(level.name);
        if (index === last) mode = levelMode;
    }
    return mode;
}

function reportDuplicateDeclarations(resolution: Resolution, level: OutletLevel, declaring: boolean, declaredBy: string): void {
    const declarations = (level.outlets ?? []).filter(candidate => candidate.name === resolution.outlet);
    const duplicates = declaring ? declarations.length - 1 : declarations.length;
    for (let duplicate = 0; duplicate < duplicates; duplicate++) {
        resolution.diagnostics.push(outletDiagnostics.duplicateOutlet(resolution.outlet, level.name, declaredBy));
    }
}

function refineLevel(resolution: Resolution, level: OutletLevel, editable: boolean): OutletMode {
    let levelMode = OutletMode.Inherits;
    for (const refinement of (level.refinements ?? []).filter(candidate => candidate.outlet === resolution.outlet)) {
        levelMode = refine(resolution, level, refinement, editable);
    }
    return levelMode;
}

function addContributions(resolution: Resolution, contributing: OutletLevel[], last: number, sources: string[]): void {
    contributing.forEach((level, index) => {
        const contributions = (level.contributions ?? []).filter(candidate => candidate.outlet === resolution.outlet);
        if (contributions.length === 0) return;
        const provenance: OutletProvenance = { owner: level.name, level: level.kind, source: OutletItemSource.Contribution };
        for (const contribution of contributions) {
            for (const item of contribution.items ?? []) place(resolution, item, provenance, index === last);
        }
        if (!sources.includes(level.name)) sources.push(level.name);
    });
}

function checkDeclaration(declaration: Outlet, owner: string, diagnostics: OutletDiagnostic[]): void {
    if (declaration.kind === OutletKind.Tabs && !declaration.slot) {
        diagnostics.push(outletDiagnostics.tabsNeedSlot(declaration.name, owner));
    }
    if (declaration.kind !== OutletKind.Actions && declaration.subject !== undefined) {
        diagnostics.push(outletDiagnostics.subjectOnlyForActions(declaration.name, declaration.kind, owner));
    }
}

function refine(resolution: Resolution, level: OutletLevel, refinement: OutletRefinement, editable: boolean): OutletMode {
    const items = refinement.items ?? [];
    const hide = refinement.hide ?? [];
    const hasChanges = items.length > 0 || hide.length > 0;
    const mode = refinement.mode ?? (hasChanges ? OutletMode.Extends : OutletMode.Inherits);
    if (mode === OutletMode.Inherits) {
        if (hasChanges) resolution.diagnostics.push(outletDiagnostics.itemsIgnoredWhenInheriting(resolution.outlet, level.name));
        return mode;
    }

    hideInherited(resolution, hide, level.name);
    if (mode === OutletMode.Overrides) overrideInherited(resolution, level.name);

    placeOwn(resolution, level, items, editable);
    return mode;
}

function placeOwn(resolution: Resolution, level: OutletLevel, items: OutletItem[], editable: boolean): void {
    resolution.floor = resolution.items.length;
    const provenance: OutletProvenance = { owner: level.name, level: level.kind, source: OutletItemSource.Own };
    for (const item of items) place(resolution, item, provenance, editable);
}

function hideInherited(resolution: Resolution, hide: string[], levelName: string): void {
    for (const id of hide) {
        if (!tryHide(resolution, entry => entry.item.id === id, levelName)) resolution.pendingHides.push({ id, owner: levelName });
    }
}

function overrideInherited(resolution: Resolution, levelName: string): void {
    for (const entry of resolution.items) {
        resolution.removed.push({ item: entry.item, provenance: entry.provenance, removal: OutletRemoval.Overridden, removedBy: levelName });
    }
    resolution.items = [];
}

function hideContributions(resolution: Resolution): void {
    for (const { id, owner } of resolution.pendingHides) {
        if (!tryHide(resolution, entry => entry.item.id === id && entry.provenance.source === OutletItemSource.Contribution, owner)) {
            resolution.diagnostics.push(outletDiagnostics.hiddenItemMissing(resolution.outlet, owner, id));
        }
    }
}

function tryHide(resolution: Resolution, matches: (entry: EffectiveOutletItem) => boolean, removedBy: string): boolean {
    const index = resolution.items.findIndex(matches);
    if (index < 0) return false;
    const [entry] = resolution.items.splice(index, 1);
    resolution.removed.push({ item: entry.item, provenance: entry.provenance, removal: OutletRemoval.Hidden, removedBy });
    return true;
}

function place(resolution: Resolution, item: OutletItem, provenance: OutletProvenance, editable: boolean): void {
    if (!accepts(resolution, item, provenance)) return;

    const entry: EffectiveOutletItem = { item: keepFittingChildren(resolution, item, provenance), provenance, editable };
    const placement = item.before !== undefined ? 'before' : item.after !== undefined ? 'after' : undefined;
    if (placement !== undefined) {
        const target = (placement === 'before' ? item.before : item.after)!;
        if (tryInsertNextTo(resolution, entry, item, provenance, placement, target)) return;
    }
    resolution.items.push(entry);
}

function accepts(resolution: Resolution, item: OutletItem, provenance: OutletProvenance): boolean {
    const { outlet, kind, diagnostics } = resolution;
    if (!outletItemKinds(kind).includes(item.kind)) {
        diagnostics.push(outletDiagnostics.itemKindMismatch(outlet, kind, provenance.owner, item));
        return false;
    }
    if (resolution.items.some(entry => entry.item.id === item.id)) {
        diagnostics.push(outletDiagnostics.duplicateItemId(outlet, provenance.owner, item.id));
        return false;
    }
    return true;
}

function keepFittingChildren(resolution: Resolution, item: OutletItem, provenance: OutletProvenance): OutletItem {
    if (item.kind !== OutletItemKind.Group) return item;
    const children = item.items ?? [];
    const kept = children.filter(child => {
        const fits = groupItemKinds.includes(child.kind);
        if (!fits) resolution.diagnostics.push(outletDiagnostics.groupItemKindMismatch(resolution.outlet, provenance.owner, item.id, child));
        return fits;
    });
    return kept.length !== children.length ? { ...item, items: kept } : item;
}

function tryInsertNextTo(resolution: Resolution, entry: EffectiveOutletItem, item: OutletItem, provenance: OutletProvenance, placement: 'before' | 'after', target: string): boolean {
    const { outlet, diagnostics } = resolution;
    const index = resolution.items.findIndex(candidate => candidate.item.id === target);
    if (index < 0) {
        diagnostics.push(outletDiagnostics.placementTargetMissing(outlet, provenance.owner, item.id, placement, target));
        return false;
    }

    let at = placement === 'before' ? index : index + 1;
    if (at < resolution.floor) {
        if (placement === 'before') diagnostics.push(outletDiagnostics.placementAboveInherited(outlet, provenance.owner, item.id, target));
        at = resolution.floor;
    }
    resolution.items.splice(at, 0, entry);
    return true;
}
