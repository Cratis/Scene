// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ModuleNavigation, Outlet, OutletRefinement, SceneDocument } from '@cratis/scene.model';
import { OutletLevelKind, type OutletLevel } from '@cratis/scene.engine';
import { navigationOf, withNavigation } from '../DesignMode/Navigation/navigationDocument';

// The levels of the application below a template that change its outlets - features and screens - kept with the document in the shape Scene reads a host's
// levels by (`OutletChainSource.levels`). A module's refinements are the navigation model's own (`navigation.modules[].refinements`), where Scene and
// Screenplay already look for them, so they are kept there.
export type OutletDocument = SceneDocument & { outletLevels?: OutletLevel[] };

// The level an outlet is edited at: the template that declares it, or a module, feature or screen below it.
export interface OutletEditingLevel {
    kind: OutletLevelKind;
    name: string;
}

export const sameLevel = (one: OutletEditingLevel | undefined, other: OutletEditingLevel | undefined): boolean =>
    one !== undefined && other !== undefined && one.kind === other.kind && one.name === other.name;

export const outletLevelsOf = (document: SceneDocument): OutletLevel[] => (document as OutletDocument).outletLevels ?? [];

export function withOutletLevels(document: SceneDocument, levels: readonly OutletLevel[]): SceneDocument {
    const { outletLevels: _, ...rest } = document as OutletDocument;
    const kept = levels.filter(level => (level.refinements ?? []).length > 0 || (level.contributions ?? []).length > 0 || (level.outlets ?? []).length > 0);
    return (kept.length === 0 ? rest : { ...rest, outletLevels: kept }) as SceneDocument;
}

// How the level refines the outlet, as the document holds it; nothing when it inherits it untouched.
export function refinementAt(document: SceneDocument, level: OutletEditingLevel, outlet: string): OutletRefinement | undefined {
    if (level.kind === OutletLevelKind.Module) {
        return navigationOf(document).modules.find(candidate => candidate.module === level.name)?.refinements?.find(candidate => candidate.outlet === outlet);
    }
    return outletLevelsOf(document)
        .find(candidate => candidate.kind === level.kind && candidate.name === level.name)
        ?.refinements?.find(candidate => candidate.outlet === outlet);
}

// The document with the level's refinement of the outlet replaced - or removed, which is how a level goes back to inheriting.
export function withRefinement(document: SceneDocument, level: OutletEditingLevel, outlet: string, refinement: OutletRefinement | undefined): SceneDocument {
    const replace = (refinements: readonly OutletRefinement[] | undefined): OutletRefinement[] => {
        const others = (refinements ?? []).filter(candidate => candidate.outlet !== outlet);
        return refinement ? [...others, refinement] : others;
    };

    if (level.kind === OutletLevelKind.Module) {
        const navigation = navigationOf(document);
        const known = navigation.modules.some(candidate => candidate.module === level.name);
        const modules: ModuleNavigation[] = (known ? navigation.modules : [...navigation.modules, { module: level.name }]).flatMap(candidate => {
            if (candidate.module !== level.name) return [candidate];
            const { refinements: _, ...rest } = candidate;
            const refinements = replace(candidate.refinements);
            const next: ModuleNavigation = refinements.length > 0 ? { ...rest, refinements } : rest;
            return next.refinements || next.contributions ? [next] : [];
        });
        return withNavigation(document, { ...navigation, modules });
    }

    const levels = outletLevelsOf(document);
    const known = levels.some(candidate => candidate.kind === level.kind && candidate.name === level.name);
    const all = known ? levels : [...levels, { kind: level.kind, name: level.name }];
    return withOutletLevels(document, all.map(candidate => {
        if (candidate.kind !== level.kind || candidate.name !== level.name) return candidate;
        const { refinements: _, ...rest } = candidate;
        const refinements = replace(candidate.refinements);
        return refinements.length > 0 ? { ...rest, refinements } : rest;
    }));
}

// The document with a template's outlets replaced: what a template offers, with its defaults (6b).
export function withTemplateOutlets(document: SceneDocument, template: string, outlets: readonly Outlet[]): SceneDocument {
    return {
        ...document,
        screenTemplates: document.screenTemplates.map(candidate => {
            if (candidate.name !== template) return candidate;
            const { outlets: _, ...rest } = candidate;
            return outlets.length > 0 ? { ...rest, outlets: [...outlets] } : rest;
        }),
    };
}
