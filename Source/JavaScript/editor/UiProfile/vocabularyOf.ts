// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { ProfileVocabulary } from './ProfileVocabulary';

/**
 * What the given packages contribute to screens. Later packages replace earlier ones of the same name,
 * matching the override priority the resolved order carries.
 *
 * @param packageNames The resolved package names, in priority order.
 * @param bundles Every known package bundle.
 * @returns The {@link ProfileVocabulary}.
 */
export function vocabularyOf(packageNames: string[], bundles: ScenePackageBundle[]): ProfileVocabulary {
    const vocabulary: ProfileVocabulary = { layouts: new Map(), screenTemplates: new Map(), dialogTemplates: new Map() };

    for (const name of packageNames) {
        const bundle = bundles.find(candidate => candidate.manifest.name === name);
        for (const layout of bundle?.layouts ?? []) vocabulary.layouts.set(layout.name, layout.slots.map(slot => slot.name));
        for (const template of bundle?.screenTemplates ?? []) vocabulary.screenTemplates.set(template.name, template.slots.map(slot => slot.name));
        for (const template of bundle?.dialogTemplates ?? []) vocabulary.dialogTemplates.set(template.name, template.slots.map(slot => slot.name));
    }

    return vocabulary;
}
