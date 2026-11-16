// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isCanvas, isDockPanel, isGrid, isStackPanel, isWrapPanel } from '@cratis/scene.engine';
import { Orientation, type Panel } from '@cratis/scene.model';
import { LayoutItem } from '../Layouts/LayoutItem';

// Which layout choice a Scene panel is, read from the shape Scene recognises panels by.
export function panelLayoutItem(panel: Panel): LayoutItem | undefined {
    if (isCanvas(panel)) return LayoutItem.Canvas;
    if (isGrid(panel)) return LayoutItem.Grid;
    if (isDockPanel(panel)) return undefined;
    if (isStackPanel(panel)) return panel.orientation === Orientation.Horizontal ? LayoutItem.Row : LayoutItem.Stack;
    if (isWrapPanel(panel)) return LayoutItem.Wrap;
    return LayoutItem.Container;
}
