// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { applyEffectiveConfiguration, renderElement, BindingResolver } from '@cratis/scene.engine';
import { EffectiveConfiguration, SceneElement } from '@cratis/scene.model';
import { ComponentRegistry, RenderBindingScopeProvider, createReactRenderer, useRenderBindingResolver } from './renderer';

export interface SceneElementViewProps {
    element: SceneElement;
    registry: ComponentRegistry;
    resolveBinding?: BindingResolver;
    dataContext?: unknown;
    queryResults?: Record<string, unknown>;
    componentOutputs?: Record<string, Record<string, unknown>>;

    /**
     * The resolved configuration of the template chain the element sits in, from `resolveEffectiveConfiguration`.
     * When given, each configurable component renders with its resolved properties - what a screen's own values add
     * to an inherited template. It is the same data the editor shows, and the same code path whether the screen is
     * being edited or played: there is no design-time mode.
     */
    configuration?: EffectiveConfiguration;

    /** Called when rendered components publish or clear output properties for typed bindings. */
    onComponentOutputsChanged?: (outputs: Record<string, Record<string, unknown>>) => void;
}

/**
 * Renders a Scene element tree with the real `Scene.React` renderer - the WYSIWYG building block Studio's
 * preview surface and Stage's shipped web bundle both consume unmodified.
 */
export function SceneElementView({
    element,
    registry,
    resolveBinding,
    configuration,
    onComponentOutputsChanged,
    dataContext,
    queryResults,
    componentOutputs,
}: SceneElementViewProps) {
    const configured = useMemo(() => configuration ? applyEffectiveConfiguration(element, configuration) : element, [element, configuration]);
    return (
        <RenderBindingScopeProvider
            dataContext={dataContext}
            queryResults={queryResults}
            componentOutputs={componentOutputs}
            resolveBinding={resolveBinding}
            onComponentOutputsChanged={onComponentOutputsChanged}>
            <RenderedElement element={configured} registry={registry} />
        </RenderBindingScopeProvider>
    );
}

function RenderedElement({ element, registry }: { element: SceneElement; registry: ComponentRegistry }) {
    const renderer = useMemo(() => createReactRenderer(registry), [registry]);
    const resolveBinding = useRenderBindingResolver();
    return <>{renderElement(element, renderer, resolveBinding)}</>;
}
