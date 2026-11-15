// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutArrangement } from '../Layouts/LayoutArrangement';
import { isOperationPermitted } from '../Structure/isOperationPermitted';
import { StructureOperation } from '../Structure/StructureOperation';
import type { StructureTreeAdapter } from '../Structure/StructureTreeAdapter';
import type { DropRegion } from './DropRegion';
import { DropRegionKind } from './DropRegionKind';
import { InsertionAxis } from './InsertionAxis';

// The marker direction that matches how an arrangement lays out its children.
export function insertionAxisFor(arrangement: LayoutArrangement | undefined): InsertionAxis {
    switch (arrangement) {
        case LayoutArrangement.Row:
        case LayoutArrangement.Wrap:
        case LayoutArrangement.Grid:
            return InsertionAxis.Vertical;
        case LayoutArrangement.Column:
        case LayoutArrangement.Grouping:
        case undefined:
            return InsertionAxis.Horizontal;
        case LayoutArrangement.Freeform:
            return InsertionAxis.None;
    }
}

function regionsFor<T>(containerId: string | null, children: T[], arrangement: LayoutArrangement | undefined, adapter: StructureTreeAdapter<T>): DropRegion[] {
    const owner = containerId ?? 'screen';
    const axis = insertionAxisFor(arrangement);
    const container: DropRegion = {
        id: `${owner}:container`,
        kind: DropRegionKind.Container,
        containerId,
        index: children.length,
        axis,
        isEmptyContainer: children.length === 0,
    };

    if (axis === InsertionAxis.None || children.length === 0) return [container];

    const between = Array.from({ length: children.length + 1 }, (_, index): DropRegion => ({
        id: `${owner}:between:${index}`,
        kind: DropRegionKind.Between,
        containerId,
        index,
        axis,
        isEmptyContainer: false,
        ...(index > 0 ? { afterId: adapter.idOf(children[index - 1]) } : {}),
        ...(index < children.length ? { beforeId: adapter.idOf(children[index]) } : {}),
    }));

    return [container, ...between];
}

// Computes every place something can be dropped, from the model and each container's arrangement - never from the
// rendered DOM. Empty containers get a container region, flow containers get a marker between every pair of siblings,
// freeform containers get a container region only (placement there is by position), and containers the current scope
// may not insert into get none.
export function computeDropRegions<T>(roots: T[], surfaceArrangement: LayoutArrangement, adapter: StructureTreeAdapter<T>): DropRegion[] {
    const nested = (nodes: T[]): DropRegion[] => nodes.flatMap(node => {
        if (!adapter.acceptsChildren(node)) return [];
        const children = adapter.childrenOf(node);
        const own = isOperationPermitted(adapter.ownershipOf(node), StructureOperation.Insert)
            ? regionsFor(adapter.idOf(node), children, adapter.arrangementOf(node), adapter)
            : [];
        return [...own, ...nested(children)];
    });

    return [...regionsFor(null, roots, surfaceArrangement, adapter), ...nested(roots)];
}
