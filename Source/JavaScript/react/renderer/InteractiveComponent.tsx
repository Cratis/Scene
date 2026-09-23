// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentType, ReactNode, createElement } from 'react';
import { ExternalComponent } from '@cratis/scene.model';
import { useInteractions } from '../interactions';
import { RegisteredComponentProps } from './ComponentRegistry';

export interface InteractiveComponentProps {
    component: ComponentType<RegisteredComponentProps>;
    element: ExternalComponent;
    slots: Record<string, ReactNode[]>;
}

/**
 * Resolves an element's interactions and hands them to the component that renders it.
 *
 * This exists as a component rather than as a call inside the renderer because resolving them is a hook, and a
 * hook cannot run inside the plain function a {@link Renderer} is. Keeping the renderer plain is what lets the
 * same element tree be rendered by something that is not React at all.
 */
export function InteractiveComponent({ component, element, slots }: InteractiveComponentProps) {
    const interactions = useInteractions(element.id, element.behaviors);
    return createElement(component, { element, slots, interactions });
}
