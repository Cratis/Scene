// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ApplicationStructure, FeatureNode } from '@cratis/scene.model';
import type { EditorSlice } from '../PropertyEditors/Registry/PropertyEditorProps';

// Every slice of the application, as the slice editor lists it: its qualified id (`module.feature.Slice`, the id Scene resolves), its name, its kind and the modules and
// features it sits in (their names), outermost first. This is the whole slice tree - slices of every module, whatever their kind - from the application structure the host
// already gives the editor, so there is one source for what a slice is (it replaces the flat list of State Change slices).
export function slicesOfStructure(structure: ApplicationStructure | undefined): EditorSlice[] {
    if (!structure) return [];
    return structure.modules.flatMap(module => [
        ...(module.slices ?? []).map(slice => ({ id: `${module.id}.${slice.id}`, name: slice.name, kind: slice.kind as string, path: [module.name] })),
        ...featuresOf(module.id, [module.name], module.features),
    ]);
}

function featuresOf(prefix: string, path: readonly string[], features: readonly FeatureNode[]): EditorSlice[] {
    return features.flatMap(feature => {
        const id = `${prefix}.${feature.id}`;
        const names = [...path, feature.name];
        return [
            ...(feature.slices ?? []).map(slice => ({ id: `${id}.${slice.id}`, name: slice.name, kind: slice.kind as string, path: names })),
            ...featuresOf(id, names, feature.features ?? []),
        ];
    });
}
