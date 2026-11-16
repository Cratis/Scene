// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentType } from 'react';
import type { LayoutArrangement } from './LayoutArrangement';

// Describes one layout container the toolbar can offer: the host decides the entries, the surface renders them.
export interface LayoutContainerDescriptor {

    // The stable component type name within the layout library, for example `Stack`.
    type: string;

    // The label shown on the container and in the toolbar.
    name: string;

    arrangement: LayoutArrangement;

    // The icon on the toolbar button.
    icon?: ComponentType<{ className?: string }>;
}
