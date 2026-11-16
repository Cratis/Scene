// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowContainerKind } from '@cratis/scene.model';
import { LayoutArrangement } from './LayoutArrangement';
import type { LayoutCatalogEntry } from './LayoutCatalogEntry';
import { LayoutItem } from './LayoutItem';
import { PanelConstruct } from './PanelConstruct';

// The layout choices offered in the Layout drawer, each mapped explicitly onto the construct Scene already has.
// Stack, Row, Grid and Container are the prototype's examples; the list is not closed: Wrap and Canvas are offered too.
// DockPanel is not, because the editor has no way to assign dock edges yet.
export const layoutCatalog: readonly LayoutCatalogEntry[] = [
    { item: LayoutItem.Stack, type: 'Stack', panel: PanelConstruct.StackPanel, flowKind: FlowContainerKind.Column, arrangement: LayoutArrangement.Column },
    { item: LayoutItem.Row, type: 'Row', panel: PanelConstruct.StackPanel, flowKind: FlowContainerKind.Row, arrangement: LayoutArrangement.Row },
    { item: LayoutItem.Grid, type: 'Grid', panel: PanelConstruct.Grid, flowKind: FlowContainerKind.Grid, arrangement: LayoutArrangement.Grid },
    { item: LayoutItem.Container, type: 'Container', panel: PanelConstruct.Panel, arrangement: LayoutArrangement.Grouping },
    { item: LayoutItem.Wrap, type: 'Wrap', panel: PanelConstruct.WrapPanel, arrangement: LayoutArrangement.Wrap },
    { item: LayoutItem.Canvas, type: 'Canvas', panel: PanelConstruct.Canvas, arrangement: LayoutArrangement.Freeform },
];
