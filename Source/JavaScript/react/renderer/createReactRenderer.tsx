// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createElement } from 'react';
import { Renderer } from '@cratis/scene.engine';
import { ContentControl, ExternalComponent, ItemsControl, Panel } from '@cratis/scene.model';
import { ComponentRegistry } from './ComponentRegistry';
import { childStyle, panelStyle } from './panelLayout';
import { UnresolvedComponent } from './UnresolvedComponent';

/**
 * Creates a {@link Renderer} that turns a Scene element tree into React elements.
 *
 * `ItemsControl` and `ContentControl` render as plain wrapping `div`s. A `Panel` renders as the
 * arrangement it declares - a grid, a stack, a wrap or a dock - because that is what those panels are
 * for; see `panelLayout` for the mapping. Arranging a *layout's slots* by `flow`/`freeform` is a
 * different thing and stays Scene#4's, layered on top of this renderer rather than folded into it.
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
            // The rendered children arrive in the same order as `element.children`, so a panel that places
            // its children individually - a grid cell, a docked edge - can wrap each one in the box that
            // places it without needing to re-render anything.
            const placed = children.map((child, index) => {
                const style = childStyle(element, element.children[index], index);
                return style
                    ? createElement('div', { key: `${element.id}-${index}`, 'data-scene-placement': index, style }, child)
                    : child;
            });

            return createElement(
                'div',
                { key: element.id, 'data-scene-id': element.id, 'data-scene-kind': 'Panel', style: panelStyle(element) },
                placed);
        },
    };
}
