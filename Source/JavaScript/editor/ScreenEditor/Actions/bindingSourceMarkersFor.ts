// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { BindingSourceMarker } from '../Surface/BindingSourceMarkers';
import type { CommandInputSource } from './commandInputSources';
import { componentOfSource } from './commandInputSources';
import type { ActionModel } from './ActionModel';

// The components an action's inputs read from, each labelled with the input it feeds and where the value comes from.
export function bindingSourceMarkersFor(action: ActionModel | undefined, sources: readonly CommandInputSource[]): BindingSourceMarker[] {
    if (!action) return [];
    return Object.entries(action.inputs).flatMap(([input, path]) => {
        const componentId = componentOfSource(path);
        if (!componentId) return [];
        const source = sources.find(candidate => candidate.path === path);
        return [{ componentId, label: `${input} \u2190 ${source?.label ?? path}` }];
    });
}
