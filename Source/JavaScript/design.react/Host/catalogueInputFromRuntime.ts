// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignCatalogueInput } from '@cratis/scene.design';
import type { ScreenEditorRuntime } from '@cratis/scene.editor';

/**
 * The part of a catalogue the packages in play already say: the component descriptors, the screen templates the packages ship, and the profile. A
 * host adds what only it has - the design system, shapes, queries, commands and sample data - as `extras`, which win over what the runtime says.
 */
export function catalogueInputFromRuntime(runtime: ScreenEditorRuntime, extras: Partial<DesignCatalogueInput> = {}): DesignCatalogueInput {
    return {
        descriptors: runtime.descriptors,
        templates: runtime.bundles.flatMap(bundle => bundle.screenTemplates ?? []),
        profile: runtime.profile,
        ...extras,
    };
}
