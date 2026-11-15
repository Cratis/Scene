// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ApplicationStructure, DestinationReference, ExternalComponent, NodeInspection, SceneElement } from '@cratis/scene.model';
import { findComponentDescriptor, isExternalComponent, type DescriptorCatalog } from '@cratis/scene.engine';
import { findSceneElement, parentOf } from '../Selection/sceneTree';
import type { Ownership } from '../Structure/Ownership';
import { createCollectionItemSource } from './collectionItemSource';
import { createElementItemSource, elementItemKinds } from './elementItemSource';
import { createOutletItemSource } from './outletItemSource';
import { designModeActions, type DesignModeItemSource, type DesignModeSubject } from './designModeTypes';
import type { OutletDesign } from './Outlets/createOutletDesign';

export interface DesignModeInputs {
    roots: readonly SceneElement[];
    catalog: DescriptorCatalog;
    selectedId: string | undefined;

    // The item selected inside the selected component, for items that are not elements of their own (a collection's rows, a region's items).
    selectedItemId: string | undefined;
    inspect: (elementId: string) => NodeInspection | undefined;
    ownershipOf: (elementId: string) => Ownership;
    newId: () => string;

    // The titles a new button and a new item start with.
    startingLabels: { button: string; item: string };

    // The application, for what a toolbar button that names a command already runs.
    structure?: ApplicationStructure;

    // Where a new navigation item leads when it has to lead somewhere.
    startingDestination?: DestinationReference;

    // The source of the items of a component that has none of its own in the document - the navigation regions (#662) bring theirs.
    otherSource?: (component: ExternalComponent, selectedItemId: string | undefined) => DesignModeItemSource | undefined;

    // The outlet an element draws, as the level being edited sees it, when the screen's template or layout declares it (StudioIssues#1330): its items are
    // then the outlet's, resolved through every level, and the element's own `items` are only what it draws on a page that declares no such outlet.
    outletDesign?: (component: ExternalComponent) => OutletDesign | undefined;
}

// Whether the selection is a design-mode component or an item of one, and if so the component, its design mode and its items. Design mode
// is active only while the component or one of its items is selected (DM1): nothing else yields a subject, so nothing else draws chrome.
export function resolveDesignMode(inputs: DesignModeInputs): DesignModeSubject | undefined {
    const { roots, catalog, selectedId, selectedItemId } = inputs;
    if (!selectedId) return undefined;
    const selected = findSceneElement(roots, selectedId);
    if (!selected) return undefined;

    const own = designModeOf(catalog, selected);
    if (own) return subjectFor(inputs, selected as ExternalComponent, own.addActionId, selectedItemId, false);

    // An item that is an element of its own - a toolbar button - is selected as itself; the component around it is what has the design mode.
    const parent = parentOf(roots, selectedId);
    const parentMode = parent && designModeOf(catalog, parent);
    if (parent && parentMode && elementItemKinds[parentMode.addActionId]) return subjectFor(inputs, parent as ExternalComponent, parentMode.addActionId, selectedId, true);
    return undefined;
}

function designModeOf(catalog: DescriptorCatalog, element: SceneElement): { mode: NonNullable<ReturnType<typeof findComponentDescriptor>>['designMode']; addActionId: string } | undefined {
    if (!isExternalComponent(element as never)) return undefined;
    const descriptor = findComponentDescriptor(catalog, (element as ExternalComponent).componentName);
    const mode = descriptor?.designMode;
    if (!mode || mode.addActions.length === 0) return undefined;
    return { mode, addActionId: mode.addActions[0].id };
}

function subjectFor(inputs: DesignModeInputs, component: ExternalComponent, addActionId: string, itemId: string | undefined, itemIsElement: boolean): DesignModeSubject | undefined {
    const { catalog, inspect, ownershipOf, newId, startingLabels } = inputs;
    const descriptor = findComponentDescriptor(catalog, component.componentName);
    const mode = descriptor?.designMode;
    if (!mode) return undefined;

    const outlet = inputs.outletDesign?.(component);
    if (outlet) {
        const selected = itemId === undefined ? undefined : outlet.items.find(item => item.id === itemId);
        return { componentId: component.id, componentName: component.componentName, mode: outlet.designMode, source: outlet, ...(selected ? { selected } : {}) };
    }

    let source: DesignModeItemSource | undefined;
    if (mode.itemsPath !== undefined && addActionId === designModeActions.addButton) {
        // An outlet of actions - the toolbar since Scene 5 - carries its buttons as its `items` property.
        const property = inspect(component.id)?.properties.find(candidate => candidate.descriptor.path === mode.itemsPath);
        source = property && createOutletItemSource({ componentId: component.id, property, newId, startingLabel: startingLabels.button, ...(inputs.structure ? { structure: inputs.structure } : {}) });
    } else if (mode.itemsPath !== undefined) {
        const property = inspect(component.id)?.properties.find(candidate => candidate.descriptor.path === mode.itemsPath);
        source = property && createCollectionItemSource({ componentId: component.id, property, newId, startingLabel: startingLabels.item, ...(inputs.startingDestination ? { startingDestination: inputs.startingDestination } : {}) });
    } else if (elementItemKinds[addActionId]) {
        source = createElementItemSource({ component, addActionId, ownershipOf, inspect, newId, startingLabel: startingLabels.button, ...(inputs.structure ? { structure: inputs.structure } : {}) });
    } else {
        source = inputs.otherSource?.(component, itemIsElement ? undefined : itemId);
    }

    if (!source) return undefined;
    const selected = itemId === undefined ? undefined : source.items.find(item => item.id === itemId);
    return { componentId: component.id, componentName: component.componentName, mode, source, ...(selected ? { selected } : {}) };
}
