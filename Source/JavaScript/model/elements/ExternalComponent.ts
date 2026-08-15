// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FrameworkElement } from './FrameworkElement';
import { SceneElement } from './SceneElement';

/**
 * A {@link FrameworkElement} resolved to a named component from a ui profile's package list rather
 * than a type modeled natively here. Vendor and internal widget libraries (PrimeReact, internal widgets)
 * plug into a renderer through this element — they are adapters, not part of the core vocabulary.
 */
export interface ExternalComponent extends FrameworkElement {
    componentName: string;
    slots: Record<string, SceneElement[]>;
}

export const ExternalComponentPropertyNames: (keyof ExternalComponent)[] = ['componentName', 'slots'];
