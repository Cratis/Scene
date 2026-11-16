// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { effectivePackages } from '@cratis/scene.engine';
import type { DesignCatalogueInput } from '@cratis/scene.design';
import type { ScreenEditorRuntime } from '@cratis/scene.editor';

/**
 * The part of a catalogue the packages in play already say: the component descriptors, the screen templates the packages of the profile ship, and
 * the profile. A host adds what only it has - the design system, shapes, queries, commands and sample data - as `extras`, which win over what the
 * runtime says.
 *
 * The templates are those of the packages the profile lists (and `core`), not of every bundle the runtime holds: a template of a package the profile does
 * not list draws components the profile cannot resolve, so offering it - as a layout of a screen, say - offers something that cannot be drawn.
 */
export function catalogueInputFromRuntime(runtime: ScreenEditorRuntime, extras: Partial<DesignCatalogueInput> = {}): DesignCatalogueInput {
    const profile = extras.profile ?? runtime.profile;
    const inPlay = new Set(effectivePackages(profile));
    return {
        descriptors: runtime.descriptors,
        templates: runtime.bundles.filter(bundle => inPlay.has(bundle.manifest.name)).flatMap(bundle => bundle.screenTemplates ?? []),
        profile: runtime.profile,
        ...extras,
    };
}
