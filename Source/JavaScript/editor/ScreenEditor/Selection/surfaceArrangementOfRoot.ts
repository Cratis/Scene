// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Panel } from '@cratis/scene.model';
import { LayoutArrangement } from '../Layouts/LayoutArrangement';
import { isCanvas, isGrid, isStackPanel } from '@cratis/scene.engine';
import { Orientation } from '@cratis/scene.model';

// How the authored root arranges what is placed directly on the screen.
export function surfaceArrangementOfRoot(root: Panel | undefined): LayoutArrangement {
    if (!root) return LayoutArrangement.Column;
    if (isCanvas(root)) return LayoutArrangement.Freeform;
    if (isGrid(root)) return LayoutArrangement.Grid;
    if (isStackPanel(root)) return root.orientation === Orientation.Horizontal ? LayoutArrangement.Row : LayoutArrangement.Column;
    return LayoutArrangement.Column;
}
