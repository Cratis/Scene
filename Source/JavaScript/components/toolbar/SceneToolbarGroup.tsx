// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ToolbarGroup } from '@cratis/components/Toolbar';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty, unionProperty } from '../properties';

/** Whether the group's buttons stack or sit in a row. */
const orientations = ['vertical', 'horizontal'] as const;

/**
 * The `Cratis.Components:toolbarGroup` component - `ToolbarGroup` from `@cratis/components/Toolbar`.
 *
 * Keeps related buttons together inside a toolbar. `slotName` opts the group into the library's toolbar
 * slot mechanism, which lets content contributed from elsewhere in the application land in this group -
 * the same idea as Scene's own contribution points, and the reason the property is worth exposing rather
 * than treating the group as purely visual.
 */
export function SceneToolbarGroup({ element, slots }: RegisteredComponentProps) {
    return (
        <ToolbarGroup
            slotName={stringProperty(element.properties, 'slotName')}
            orientation={unionProperty(element.properties, 'orientation', orientations)}
        >
            {slots.content}
        </ToolbarGroup>
    );
}
