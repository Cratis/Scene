// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateScope, type Layout, type UiProfile } from '@cratis/scene.model';
import type { TemplateTarget } from '@cratis/scene.engine';

/** What the screen editor knows about where the screen it edits sits - enough for Scene to say which templates apply. */
export interface ScreenTemplateTargetInputs {
    /** The packages in play, in ascending override priority. */
    bundles: readonly { layouts?: readonly Layout[] }[];

    /** The profile the screen is drawn under, which names the shell layout a template goes into. */
    profile: Pick<UiProfile, 'layout'>;

    /** Where in the application the screen sits; a screen of a slice unless the host says otherwise. */
    scope?: TemplateScope;
}

/**
 * The target the screen's templates are chosen for: the scope, and the profile's shell layout as the container a
 * template has to fit a slot of. Without the container Scene cannot place a template that names a slot it fits.
 *
 * @param inputs Where the screen sits.
 * @returns The Scene {@link TemplateTarget}.
 */
export function screenTemplateTarget({ bundles, profile, scope }: ScreenTemplateTargetInputs): TemplateTarget {
    const layout = profile.layout
        ? [...bundles].reverse().flatMap(bundle => [...(bundle.layouts ?? [])]).find(candidate => candidate.name === profile.layout)
        : undefined;
    return { scope: scope ?? TemplateScope.Slice, ...(layout ? { container: { name: layout.name, slots: layout.slots } } : {}) };
}
