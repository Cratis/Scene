// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DropRegionKind } from './DropRegionKind';
import type { InsertionAxis } from './InsertionAxis';

// A place something can be dropped, described by the model rather than by pixels. The chrome finds where to draw
// it from the container's and siblings' ids, so an empty container - which renders nothing to hang a marker on -
// still has a region.
export interface DropRegion {
    id: string;
    kind: DropRegionKind;

    // The container the drop lands in, or null for the screen itself.
    containerId: string | null;

    // The position among the container's children.
    index: number;
    axis: InsertionAxis;
    isEmptyContainer: boolean;

    // The sibling the marker sits after, when there is one.
    afterId?: string;

    // The sibling the marker sits before, when there is one.
    beforeId?: string;
}
