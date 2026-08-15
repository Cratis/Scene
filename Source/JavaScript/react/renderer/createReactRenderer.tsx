// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createElement } from 'react';
import { Renderer } from '@cratis/scene.engine';
import { ContentControl, ExternalComponent, ItemsControl, Panel } from '@cratis/scene.model';
import { ComponentRegistry } from './ComponentRegistry';
import { UnresolvedComponent } from './UnresolvedComponent';

/**
 * Creates a {@link Renderer} that turns a Scene element tree into React elements. `Panel`, `ItemsControl`
 * and `ContentControl` render as plain wrapping `div`s here - arranging them according to a layout's
 * `flow`/`freeform` arrangement is Scene#4's job, layered on top of this renderer rather than folded
 * into it.
 */
export function createReactRenderer(registry: ComponentRegistry): Renderer<ReactNode> {
    return {
        renderContentControl(element: ContentControl, content: ReactNode): ReactNode {
            return createElement('div', { key: element.id, 'data-scene-id': element.id, 'data-scene-kind': 'ContentControl' }, content);
        },

        renderItemsControl(element: ItemsControl, items: ReactNode[]): ReactNode {
            return createElement('div', { key: element.id, 'data-scene-id': element.id, 'data-scene-kind': 'ItemsControl' }, items);
        },

        renderExternalComponent(element: ExternalComponent, slots: Record<string, ReactNode[]>): ReactNode {
            const Component = registry[element.componentName] ?? UnresolvedComponent;
            return createElement(Component, { key: element.id, element, slots });
        },

        renderPanel(element: Panel, children: ReactNode[]): ReactNode {
            return createElement('div', { key: element.id, 'data-scene-id': element.id, 'data-scene-kind': 'Panel' }, children);
        },
    };
}
