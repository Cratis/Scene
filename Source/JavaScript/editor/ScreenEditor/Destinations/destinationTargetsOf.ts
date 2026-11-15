// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import type { DestinationTargets } from './destinationProblems';

// What a destination may lead to on this screen: the application's screens and State Change slices the host lent the
// editor, the slots the layouts and templates in play declare, and the dialog templates of the packages and the document.
export function destinationTargetsOf(environment: ScreenEditorEnvironment, document: SceneDocument): DestinationTargets {
    const bundles = environment.runtime.bundles;
    return {
        screens: unique(environment.destinations.map(destination => destination.id)),
        slots: unique([
            ...bundles.flatMap(bundle => (bundle.layouts ?? []).flatMap(layout => layout.slots ?? [])),
            ...bundles.flatMap(bundle => (bundle.screenTemplates ?? []).flatMap(template => template.slots ?? [])),
            ...document.layouts.flatMap(layout => layout.slots ?? []),
            ...document.screenTemplates.flatMap(template => template.slots ?? []),
        ].map(slot => slot.name)),
        dialogTemplates: unique([...bundles.flatMap(bundle => bundle.dialogTemplates ?? []), ...document.dialogTemplates].map(template => template.name)),
        slices: unique(environment.stateChangeSlices.map(slice => slice.id)),
    };
}

export function unique(values: readonly string[]): string[] {
    return [...new Set(values.filter(value => value.length > 0))].sort((first, second) => first.localeCompare(second));
}
