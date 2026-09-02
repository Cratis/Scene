// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Panel } from '../Panel';
import { Orientation } from '../../common';

/**
 * Lays its children out in a line and starts a new one whenever the current line runs out of room.
 */
export interface WrapPanel extends Panel {
    orientation: Orientation;
    itemWidth?: number;
    itemHeight?: number;
}

export const WrapPanelPropertyNames: (keyof WrapPanel)[] = ['orientation', 'itemWidth', 'itemHeight'];
