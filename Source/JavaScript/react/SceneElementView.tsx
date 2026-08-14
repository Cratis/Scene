// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { renderElement, BindingResolver } from '@cratis/scene.engine';
import { SceneElement } from '@cratis/scene.model';
import { ComponentRegistry, createReactRenderer } from './renderer';

export interface SceneElementViewProps {
    element: SceneElement;
    registry: ComponentRegistry;
    resolveBinding: BindingResolver;
}

/**
 * Renders a Scene element tree with the real `Scene.React` renderer - the WYSIWYG building block Studio's
 * preview surface and Stage's shipped web bundle both consume unmodified.
 */
export function SceneElementView({ element, registry, resolveBinding }: SceneElementViewProps) {
    const renderer = useMemo(() => createReactRenderer(registry), [registry]);
    return <>{renderElement(element, renderer, resolveBinding)}</>;
}
