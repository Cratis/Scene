// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from './SceneElement';
import { Visibility, Size } from '../common';

/**
 * A {@link SceneElement} that occupies space and can be shown or hidden.
 */
export interface VisualElement extends SceneElement {
    visibility: Visibility;
    isEnabled: boolean;
    opacity: number;
    size: Size;
    zIndex: number;
}

export const VisualElementPropertyNames: (keyof VisualElement)[] = ['visibility', 'isEnabled', 'opacity', 'size', 'zIndex'];
