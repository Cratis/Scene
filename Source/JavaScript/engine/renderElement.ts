// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { Renderer } from './Renderer';
import { BindingResolver } from './BindingResolver';
import { isContentControl, isItemsControl, isExternalComponent, isPanel } from './elementKind';

/**
 * Walks a Scene element tree, rendering each node's children before the node itself, and hands the
 * result to the supplied {@link Renderer}. This is a structural tree walk only - resolving a `ui
 * profile`'s package list, aggregating contribution points, and computing layout arrangement are the
 * jobs of the profile resolution, contribution runtime and layout engines (Scene#3, Scene#2, Scene#4),
 * layered on top of this walk rather than folded into it.
 */
export function renderElement<TOutput>(element: SceneElement, renderer: Renderer<TOutput>, resolveBinding: BindingResolver): TOutput {
    if (isContentControl(element)) {
        return renderer.renderContentControl(element, renderElement(element.content, renderer, resolveBinding));
    }

    if (isItemsControl(element)) {
        const items = resolveBinding(element.itemsSource);
        const itemCount = Array.isArray(items) ? items.length : 0;
        const rendered = Array.from({ length: itemCount }, () => renderElement(element.itemTemplate, renderer, resolveBinding));
        return renderer.renderItemsControl(element, rendered);
    }

    if (isExternalComponent(element)) {
        const slots = Object.fromEntries(
            Object.entries(element.slots).map(([name, children]) => [name, children.map(child => renderElement(child, renderer, resolveBinding))]),
        );
        return renderer.renderExternalComponent(element, slots);
    }

    if (isPanel(element)) {
        return renderer.renderPanel(element, element.children.map(child => renderElement(child, renderer, resolveBinding)));
    }

    throw new Error(`Scene element '${element.id}' is not a recognized concrete kind (ContentControl, ItemsControl, ExternalComponent or Panel).`);
}
