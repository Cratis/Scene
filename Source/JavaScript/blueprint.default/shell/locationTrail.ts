// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FeatureNode } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { SceneNavigationModel } from '@cratis/scene.react';

/** One crumb of the trail derived from where the host is. */
export interface LocationCrumb {
    /** What the crumb says: the display name of the module or feature. */
    label: string;

    /** The screen the crumb goes back to; absent for the page that is shown. */
    targetScreen?: string;
}

/**
 * The trail from the application down to the screen on the page: the module, then each feature on the way (spec N4). It is
 * worked out from the structure and the host's location alone, so it follows every navigation and a screen's document does not
 * have to repeat it. A module crumb leads to the module's first feature; the last crumb is the page and leads nowhere.
 *
 * @param model The structure the screens belong to.
 * @param screen The screen in the host's primary region: its qualified id (`sales.orders`).
 * @returns The crumbs, outermost first; empty when the screen is not in the structure.
 */
export function locationTrail(model: SceneNavigationModel, screen: string | undefined): LocationCrumb[] {
    if (screen === undefined) return [];
    const index = model.structure instanceof ApplicationStructureIndex ? model.structure : new ApplicationStructureIndex(model.structure);
    const [moduleId, ...path] = screen.split('.');
    const module = index.findModule(moduleId);
    if (!module) return [];

    const crumbs: LocationCrumb[] = [{ label: module.name, targetScreen: index.firstFeatureId(moduleId) }];
    let features: FeatureNode[] | undefined = module.features;
    const walked: string[] = [moduleId];
    for (const id of path) {
        const feature: FeatureNode | undefined = features?.find(candidate => candidate.id === id);
        if (!feature) return [];
        walked.push(id);
        crumbs.push({ label: feature.name, targetScreen: walked.join('.') });
        features = feature.features;
    }

    // The page itself is not a link.
    const last = crumbs[crumbs.length - 1];
    crumbs[crumbs.length - 1] = { label: last.label };
    return crumbs;
}
