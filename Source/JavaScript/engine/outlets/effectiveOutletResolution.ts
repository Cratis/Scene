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
}

/**
 * Resolves an outlet for the last level of a chain. The first level that declares the outlet supplies its defaults; each
 * level below it inherits, extends (hiding some and adding its own after the inherited ones) or overrides; then every
 * contribution - from the chain and from the contributors - is added. An item without `before` or `after` always goes
 * last, so a level's own items never move above the ones it inherits.
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
    const resolution: Resolution = { outlet, kind: declaration.kind, items: [], removed: [], diagnostics: [] };
    checkDeclaration(declaration, declaringLevel.name, resolution.diagnostics);

    const sources = [declaringLevel.name];
    const defaults: OutletProvenance = { owner: declaringLevel.name, level: declaringLevel.kind, source: OutletItemSource.Default };
    for (const item of declaration.defaults ?? []) place(resolution, item, defaults, declaringIndex === last);

    let mode: OutletMode | undefined;
    for (let index = declaringIndex; index < chain.length; index++) {
        const level = chain[index];
        const declarations = (level.outlets ?? []).filter(candidate => candidate.name === outlet);
        const duplicates = index === declaringIndex ? declarations.length - 1 : declarations.length;
        for (let duplicate = 0; duplicate < duplicates; duplicate++) {
            resolution.diagnostics.push(outletDiagnostics.duplicateOutlet(outlet, level.name, declaringLevel.name));
        }
        if (index === declaringIndex) continue;

        let levelMode = OutletMode.Inherits;
        for (const refinement of (level.refinements ?? []).filter(candidate => candidate.outlet === outlet)) {
            levelMode = refine(resolution, level, refinement, index === last);
        }
        if (levelMode !== OutletMode.Inherits && !sources.includes(level.name)) sources.push(level.name);
        if (index === last) mode = levelMode;
    }

    [...chain, ...contributors].forEach((level, index) => {
        const contributions = (level.contributions ?? []).filter(candidate => candidate.outlet === outlet);
        if (contributions.length === 0) return;
        const provenance: OutletProvenance = { owner: level.name, level: level.kind, source: OutletItemSource.Contribution };
        for (const contribution of contributions) {
            for (const item of contribution.items ?? []) place(resolution, item, provenance, index === last);
        }
        if (!sources.includes(level.name)) sources.push(level.name);
    });

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
    const mode = refinement.mode ?? (items.length > 0 || hide.length > 0 ? OutletMode.Extends : OutletMode.Inherits);
    if (mode === OutletMode.Inherits) {
        if (items.length > 0 || hide.length > 0) resolution.diagnostics.push(outletDiagnostics.itemsIgnoredWhenInheriting(resolution.outlet, level.name));
        return mode;
    }

    for (const id of hide) {
        const index = resolution.items.findIndex(entry => entry.item.id === id);
        if (index < 0) {
            resolution.diagnostics.push(outletDiagnostics.hiddenItemMissing(resolution.outlet, level.name, id));
            continue;
        }
        const [entry] = resolution.items.splice(index, 1);
        resolution.removed.push({ item: entry.item, provenance: entry.provenance, removal: OutletRemoval.Hidden, removedBy: level.name });
    }

    if (mode === OutletMode.Overrides) {
        for (const entry of resolution.items) {
            resolution.removed.push({ item: entry.item, provenance: entry.provenance, removal: OutletRemoval.Overridden, removedBy: level.name });
        }
        resolution.items = [];
    }

    const provenance: OutletProvenance = { owner: level.name, level: level.kind, source: OutletItemSource.Own };
    for (const item of items) place(resolution, item, provenance, editable);
    return mode;
}

function place(resolution: Resolution, item: OutletItem, provenance: OutletProvenance, editable: boolean): void {
    const { outlet, kind, diagnostics } = resolution;
    if (!outletItemKinds(kind).includes(item.kind)) {
        diagnostics.push(outletDiagnostics.itemKindMismatch(outlet, kind, provenance.owner, item));
        return;
    }
    if (resolution.items.some(entry => entry.item.id === item.id)) {
        diagnostics.push(outletDiagnostics.duplicateItemId(outlet, provenance.owner, item.id));
        return;
    }

    let placed: OutletItem = item;
    if (item.kind === OutletItemKind.Group) {
        const children = item.items ?? [];
        const kept = children.filter(child => {
            const fits = groupItemKinds.includes(child.kind);
            if (!fits) diagnostics.push(outletDiagnostics.groupItemKindMismatch(outlet, provenance.owner, item.id, child));
            return fits;
        });
        if (kept.length !== children.length) placed = { ...item, items: kept };
    }

    const entry: EffectiveOutletItem = { item: placed, provenance, editable };
    const placement = item.before !== undefined ? 'before' : item.after !== undefined ? 'after' : undefined;
    if (placement !== undefined) {
        const target = (placement === 'before' ? item.before : item.after)!;
        const index = resolution.items.findIndex(candidate => candidate.item.id === target);
        if (index >= 0) {
            resolution.items.splice(placement === 'before' ? index : index + 1, 0, entry);
            return;
        }
        diagnostics.push(outletDiagnostics.placementTargetMissing(outlet, provenance.owner, item.id, placement, target));
    }
    resolution.items.push(entry);
}
