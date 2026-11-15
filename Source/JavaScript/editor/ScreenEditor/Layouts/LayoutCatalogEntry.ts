// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { FlowContainerKind } from '@cratis/scene.model';
import type { LayoutArrangement } from './LayoutArrangement';
import type { LayoutItem } from './LayoutItem';
import type { PanelConstruct } from './PanelConstruct';

// One layout choice and the canonical construct it stands for.
export interface LayoutCatalogEntry {
    item: LayoutItem;

    // The component type name the layout library registers it under.
    type: string;

    // The Scene panel the choice maps onto.
    panel: PanelConstruct;

    // The flow primitive the choice maps onto, when Scene reflows it per size class. Panels with no flow primitive leave this out.
    flowKind?: FlowContainerKind;

    // How the container arranges what is inside it.
    arrangement: LayoutArrangement;
}
