// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FrameworkElement } from './FrameworkElement';
import { SceneElement } from './SceneElement';

/**
 * A {@link FrameworkElement} that lays out an arbitrary number of children.
 */
export interface Panel extends FrameworkElement {
    children: SceneElement[];
}

export const PanelPropertyNames: (keyof Panel)[] = ['children'];
