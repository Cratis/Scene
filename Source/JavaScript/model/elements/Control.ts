// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FrameworkElement } from './FrameworkElement';
import { Color, Thickness } from '../common';

/**
 * A {@link FrameworkElement} that can be styled with colors, spacing and typography, and that
 * participates in tab order.
 */
export interface Control extends FrameworkElement {
    background?: Color;
    foreground?: Color;
    borderColor?: Color;
    borderThickness: Thickness;
    padding: Thickness;
    fontFamily?: string;
    fontSize?: number;
    tabIndex: number;
}

export const ControlPropertyNames: (keyof Control)[] = [
    'background', 'foreground', 'borderColor', 'borderThickness', 'padding', 'fontFamily', 'fontSize', 'tabIndex',
];
