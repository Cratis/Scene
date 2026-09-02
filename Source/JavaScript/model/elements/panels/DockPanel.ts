// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Panel } from '../Panel';

/**
 * Lays its children out against its edges, each child stating which edge through the `Dock` key
 * of its `properties`.
 */
export interface DockPanel extends Panel {
    lastChildFill: boolean;
}

export const DockPanelPropertyNames: (keyof DockPanel)[] = ['lastChildFill'];
