// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '../elements';

/**
 * The absolute position and size of one element within a {@link FreeformVariant}.
 */
export interface ElementPlacement {
    element: SceneElement;
    x: number;
    y: number;
    width: number;
    height: number;
}

export const ElementPlacementPropertyNames: (keyof ElementPlacement)[] = ['element', 'x', 'y', 'width', 'height'];
