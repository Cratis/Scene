// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isExternalComponent, isPanel } from '@cratis/scene.engine';
import type { Panel, SceneElement } from '@cratis/scene.model';
import { LayoutItem } from '../Layouts/LayoutItem';
import { LayoutArrangement } from '../Layouts/LayoutArrangement';
import { Ownership } from '../Structure/Ownership';
import type { OwnershipResolver } from '../Structure/OwnershipResolver';
import type { StructureTreeAdapter } from '../Structure/StructureTreeAdapter';
import { childrenOfElement } from './sceneTree';
import { panelLayoutItem } from './panelLayoutItem';

const idOf = (element: SceneElement): string => (element as { id: string }).id;
const nameOf = (element: SceneElement): string => (element as { name?: string }).name || idOf(element);

const arrangementOfItem = (item: LayoutItem | undefined): LayoutArrangement | undefined => {
    switch (item) {
        case LayoutItem.Stack: return LayoutArrangement.Column;
        case LayoutItem.Row: return LayoutArrangement.Row;
        case LayoutItem.Grid: return LayoutArrangement.Grid;
        case LayoutItem.Wrap: return LayoutArrangement.Wrap;
        case LayoutItem.Canvas: return LayoutArrangement.Freeform;
        case LayoutItem.Container: return LayoutArrangement.Grouping;
        case undefined: return undefined;
    }
};

// Teaches the structure tools to read a Scene element tree. Only panels take children; a component's slots are read-only structure.
export function createSceneStructureAdapter(ownershipOf: OwnershipResolver): StructureTreeAdapter<SceneElement> {
    return {
        idOf,
        nameOf,
        childrenOf: childrenOfElement,
        withChildren: (element, children) => isPanel(element)
            ? ({ ...element, children } as Panel)
            : isExternalComponent(element) ? ({ ...element, slots: { children } } as SceneElement) : element,
        acceptsChildren: element => isPanel(element),
        ownershipOf: element => ownershipOf(idOf(element)) ?? Ownership.Local,
        arrangementOf: element => isPanel(element) ? arrangementOfItem(panelLayoutItem(element)) : undefined,
    };
}
