// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GridUnitType, Orientation, type Panel, type SceneElement } from '@cratis/scene.model';
import { LayoutItem } from '../Layouts/LayoutItem';
import { frameworkElement } from './frameworkElement';

const star = { unitType: GridUnitType.Star, value: 1 };

// Creates the Scene panel that a layout choice stands for. The panel kinds are recognised by their shape, so each
// one writes the fields that identify it - an empty wrap panel still says it has an orientation and no spacing.
export function createPanel(item: LayoutItem, id: string, name: string, children: SceneElement[] = [], extent: { width?: number; height?: number } = {}): Panel {
    const own = ownFields(item, extent);
    return { ...frameworkElement(id, name), children, ...own } as unknown as Panel;
}

function ownFields(item: LayoutItem, extent: { width?: number; height?: number }): Record<string, unknown> {
    switch (item) {
        case LayoutItem.Stack:
            return { orientation: Orientation.Vertical, spacing: 8 };
        case LayoutItem.Row:
            return { orientation: Orientation.Horizontal, spacing: 8 };
        case LayoutItem.Grid:
            return {
                rows: [],
                columns: [
                    { width: star, minimumWidth: 0, maximumWidth: Number.POSITIVE_INFINITY },
                    { width: star, minimumWidth: 0, maximumWidth: Number.POSITIVE_INFINITY },
                ],
            };
        case LayoutItem.Wrap:
            return { orientation: Orientation.Horizontal };
        case LayoutItem.Canvas:
            return { extent };
        case LayoutItem.Container:
            return {};
    }
}
