// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import type { ExternalComponent } from '@cratis/scene.model';
import { readActionModel } from '../Actions/actionBehavior';
import { bindingSourceMarkersFor } from '../Actions/bindingSourceMarkersFor';
import { commandInputSources } from '../Actions/commandInputSources';
import { bindingSourceInventory } from '../Binding/bindingSources';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { findSceneElement } from '../Selection/sceneTree';
import type { BindingSourceMarker } from './BindingSourceMarkers';

// The components the selected element takes values from, for the surface to outline.
export function useSelectedBindingMarkers(controller: ScreenEditorController, environment: ScreenEditorEnvironment): BindingSourceMarker[] {
    const { selectedId, document, composition, context } = controller;
    return useMemo(() => {
        if (!selectedId) return [];
        const selected = findSceneElement(composition.roots, selectedId) as ExternalComponent | undefined;
        const action = readActionModel(selected?.properties);
        if (!action) return [];
        const inventory = bindingSourceInventory(document, composition.roots, context, environment.availableSources, environment.queryCandidates);
        return bindingSourceMarkersFor(action, commandInputSources(inventory.dataContextPaths, inventory.componentOutputs, selectedId));
    }, [selectedId, document, composition, context, environment.availableSources, environment.queryCandidates]);
}
