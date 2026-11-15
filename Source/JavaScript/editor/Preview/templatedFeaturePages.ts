// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { FeatureNode, Screen, TemplateReference } from '@cratis/scene.model';
import type { PreviewScene } from './PreviewScene';

/**
 * The pages of the features that are shown by a template alone.
 *
 * A feature whose shape is a template - assigned to it, to the feature it is in, to its module or to the application - and that has no screen written
 * for it has no screen in the compiled scene, so the preview host refused it with `screenMissing` ("The feature has no screen in the document") although
 * nothing was missing: the template is the screen. The page is made here from the template the feature would be built from, the nearest assignment
 * winning, and carries the path that tells the host where it lives. A feature with a screen of its own, or one no template is assigned to, is left as
 * it is.
 *
 * @param scene The scene the model compiled to.
 * @param layout The layout the pages are placed on: the shell the application's profile selects, or the first the document declares.
 * @returns The pages to add to the scene's screens.
 */
export function templatedFeaturePages(scene: Pick<PreviewScene, 'structure' | 'screens' | 'layouts' | 'templateReferences'>, layout?: string): Screen[] {
    const assignments = scene.templateReferences ?? [];
    if (assignments.length === 0) return [];

    const taken = new Set(scene.screens.flatMap(screen => [screen.name, ...(screen.path && screen.path.length >= 2 ? [screen.path.join('.')] : [])]));
    const placedOn = layout ?? scene.layouts[0]?.name ?? '';
    const pages: Screen[] = [];
    const assigned = (scope: string, owner: string): TemplateReference | undefined => assignments.find(assignment => assignment.scope === scope && assignment.owner === owner)?.reference;

    // The nearest assignment wins: the feature's own, then each feature and the module around it, then the application's.
    const referenceFor = (path: readonly string[]): TemplateReference | undefined => {
        for (let length = path.length; length >= 2; length--) {
            const found = assigned('feature', path.slice(0, length).join('.'));
            if (found) return found;
        }
        return assigned('module', path[0]) ?? assigned('application', '');
    };

    const visit = (feature: FeatureNode, parent: readonly string[]) => {
        const path = [...parent, feature.name];
        const qualified = path.join('.');
        const reference = taken.has(qualified) ? undefined : referenceFor(path);
        if (reference && feature.slices.length > 0) {
            taken.add(qualified);
            pages.push({ name: qualified, layout: placedOn, slotContent: {}, forms: [], contributions: [], screenTemplate: reference.id, path });
        }

        feature.features.forEach(child => visit(child, path));
    };

    scene.structure.modules.forEach(module => module.features.forEach(feature => visit(feature, [module.name])));
    return pages;
}
