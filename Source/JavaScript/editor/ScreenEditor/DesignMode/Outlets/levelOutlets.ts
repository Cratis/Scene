// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { OutletRefinement, SceneDocument } from '@cratis/scene.model';
import { OutletLevelKind } from '@cratis/scene.engine';
import { navigationOf, withNavigation } from '../Navigation/navigationDocument';
import { outletLevelsOf, withOutletLevels, withRefinement, type OutletEditingLevel } from '../../Outlets/outletDocument';

// What a module or a feature says about the outlets its template exposes, for an outlet of any kind. It is the host's - Studio keeps it with the module and the feature, so the
// board's header, the screens below it and an export all read one thing (StudioIssues#1327) - and a screen only stores its own refinements. While the screen is edited the
// levels are held in the document, because that is where Scene resolves the chain from and where undo and redo are; they are put there when the screen opens and taken out
// again, as their own, when it is saved.
export interface LevelRefinements {
    kind: OutletLevelKind.Module | OutletLevelKind.Feature;
    name: string;
    refinements: readonly OutletRefinement[];
}

export const isHostedLevel = (kind: OutletLevelKind): kind is LevelRefinements['kind'] => kind === OutletLevelKind.Module || kind === OutletLevelKind.Feature;

// The document with the levels the host keeps put in it. What the host says about an outlet is what is in force; what the document still says about another outlet of the same
// level - written before the host kept them - stays until the screen is saved, when it moves to the host.
export function withLevelOutlets(document: SceneDocument, levels: readonly LevelRefinements[]): SceneDocument {
    return levels.reduce<SceneDocument>((current, level) => level.refinements.reduce(
        (inner, refinement) => withRefinement(inner, level as OutletEditingLevel, refinement.outlet, refinement), current), document);
}

// The levels the document holds that the host keeps, and the document without them.
export function withoutLevelOutlets(document: SceneDocument): { document: SceneDocument; levels: LevelRefinements[] } {
    const levels: LevelRefinements[] = [];
    const features = outletLevelsOf(document);
    for (const level of features) {
        if (level.kind === OutletLevelKind.Feature && (level.refinements ?? []).length > 0) {
            levels.push({ kind: OutletLevelKind.Feature, name: level.name, refinements: [...(level.refinements ?? [])] });
        }
    }
    const navigation = navigationOf(document);
    for (const module of navigation.modules) {
        if ((module.refinements ?? []).length > 0) {
            levels.push({ kind: OutletLevelKind.Module, name: module.module, refinements: [...(module.refinements ?? [])] });
        }
    }

    let stripped = withOutletLevels(document, features.flatMap(level => {
        if (level.kind !== OutletLevelKind.Feature) return [level];
        const { refinements: _, ...rest } = level;
        return [rest];
    }));
    if (navigation.modules.some(module => module.refinements)) {
        stripped = withNavigation(stripped, {
            ...navigation,
            modules: navigation.modules.flatMap(module => {
                const { refinements: _, ...rest } = module;
                return rest.contributions ? [rest] : [];
            }),
        });
    }
    return { document: stripped, levels };
}
