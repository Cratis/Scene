// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isCanvas, isGrid, isStackPanel } from '@cratis/scene.engine';
import { Orientation, type Panel } from '@cratis/scene.model';
import { SurfaceLayout } from './SurfaceLayout';

// The surface layout for the authored root, so what is saved beside the document says how the screen flows.
export function surfaceLayoutOfRoot(root: Panel | undefined): SurfaceLayout {
    if (!root) return SurfaceLayout.absolute;
    if (isGrid(root)) return SurfaceLayout.grid;
    if (isStackPanel(root)) return root.orientation === Orientation.Horizontal ? SurfaceLayout.flexRow : SurfaceLayout.flexColumn;
    return isCanvas(root) ? SurfaceLayout.absolute : SurfaceLayout.flexColumn;
}
