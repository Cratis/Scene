// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ContentControl, Control, ExternalComponent, HorizontalAlignment, ItemsControl, Panel, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { Renderer, renderElement } from '../index';

function control(id: string): Control {
    return {
        id,
        name: id,
        properties: {},
        visibility: Visibility.Visible,
        isEnabled: true,
        opacity: 1,
        size: {},
        zIndex: 0,
        minimumSize: {},
        maximumSize: {},
        margin: { left: 0, top: 0, right: 0, bottom: 0 },
        horizontalAlignment: HorizontalAlignment.Stretch,
        verticalAlignment: VerticalAlignment.Stretch,
        borderThickness: { left: 0, top: 0, right: 0, bottom: 0 },
        padding: { left: 0, top: 0, right: 0, bottom: 0 },
        tabIndex: 0,
    };
}

class StringRenderer implements Renderer<string> {
    renderContentControl(element: ContentControl, content: string): string {
        return `ContentControl(${element.id})[${content}]`;
    }

    renderItemsControl(element: ItemsControl, items: string[]): string {
        return `ItemsControl(${element.id})[${items.join(',')}]`;
    }

    renderExternalComponent(element: ExternalComponent, slots: Record<string, string[]>): string {
        const slotsText = Object.entries(slots).map(([name, children]) => `${name}=${children.join(',')}`).join(';');
        return `ExternalComponent(${element.componentName})[${slotsText}]`;
    }

    renderPanel(element: Panel, children: string[]): string {
        return `Panel(${element.id})[${children.join(',')}]`;
    }
}

describe('when rendering a mixed tree', () => {
    const badge: ExternalComponent = { ...control('badge'), componentName: 'core:badge', slots: {} };
    const itemTemplate: ContentControl = { ...control('row'), content: badge };
    const items: ItemsControl = { ...control('items'), itemsSource: { path: 'rows' }, itemTemplate };
    const root: Panel = { ...control('root'), children: [items] };

    const output = renderElement(root, new StringRenderer(), binding => (binding.path === 'rows' ? [{}, {}] : []));

    it('should render the panel wrapping the items control', () => output.should.equal(
        'Panel(root)[ItemsControl(items)[ContentControl(row)[ExternalComponent(core:badge)[]],ContentControl(row)[ExternalComponent(core:badge)[]]]]',
    ));
});
