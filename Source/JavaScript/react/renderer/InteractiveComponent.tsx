// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentType, ReactNode, createElement, useEffect, useMemo } from 'react';
import { BindingExpression, ExternalComponent } from '@cratis/scene.model';
import { useInteractions } from '../interactions';
import { useBindingOutputs } from './BindingOutputContext';
import { RegisteredComponentProps } from './ComponentRegistry';
import { useRenderBindingResolver } from './RenderBindingScopeContext';

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
    const bindingOutputs = useBindingOutputs(element.id);
    const resolveBinding = useRenderBindingResolver();
    const resolvedElement = useMemo(() => ({
        ...element,
        properties: resolveProperties(element.properties, resolveBinding),
    }), [element, resolveBinding]);
    useEffect(() => () => bindingOutputs.clearAll(), [element.id]);
    return createElement(component, { element: resolvedElement, slots, interactions, bindingOutputs });
}

function resolveProperties(properties: Record<string, unknown>, resolveBinding: (binding: BindingExpression) => unknown): Record<string, unknown> {
    return Object.fromEntries(Object.entries(properties).map(([name, value]) => [name, resolveValue(value, resolveBinding)]));
}

function resolveValue(value: unknown, resolveBinding: (binding: BindingExpression) => unknown): unknown {
    if (isBindingExpression(value)) return resolveBinding(value);
    if (isDestinationReference(value)) return value;
    if (Array.isArray(value)) return value.map(entry => resolveValue(entry, resolveBinding));
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([name, entry]) => [name, resolveValue(entry, resolveBinding)]));
    }

    return value;
}

function isBindingExpression(value: unknown): value is BindingExpression {
    return value !== null && typeof value === 'object' && !Array.isArray(value) && typeof (value as Record<string, unknown>).path === 'string';
}

function isDestinationReference(value: unknown): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value) && 'routeParameterBindings' in value;
}
