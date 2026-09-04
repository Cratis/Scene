// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Panel } from '../Panel';
import { Orientation } from '../../common';

/**
 * Lays its children out in a single line.
 */
export interface StackPanel extends Panel {
    orientation: Orientation;
    spacing: number;
}

export const StackPanelPropertyNames: (keyof StackPanel)[] = ['orientation', 'spacing'];
