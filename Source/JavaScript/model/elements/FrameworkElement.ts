// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { VisualElement } from './VisualElement';
import { Size, Thickness, HorizontalAlignment, VerticalAlignment } from '../common';

/**
 * A {@link VisualElement} that participates in layout: it has a name, size constraints,
 * margin and alignment within the space allotted to it by its parent.
 */
export interface FrameworkElement extends VisualElement {
    name: string;
    minimumSize: Size;
    maximumSize: Size;
    margin: Thickness;
    horizontalAlignment: HorizontalAlignment;
    verticalAlignment: VerticalAlignment;
}

export const FrameworkElementPropertyNames: (keyof FrameworkElement)[] = [
    'name', 'minimumSize', 'maximumSize', 'margin', 'horizontalAlignment', 'verticalAlignment',
];
