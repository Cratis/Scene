// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Toolbar } from '@cratis/components/Toolbar';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, unionProperty } from '../properties';

/** Whether the toolbar runs down the side or across the top. */
const orientations = ['vertical', 'horizontal'] as const;

/**
 * The `Cratis.Components:toolbar` component - `Toolbar` from `@cratis/components/Toolbar`.
 *
 * The container for a tool palette: it draws the rounded chrome and, more importantly, establishes the
 * drag context every `toolbarButton` inside it reads. `draggable` therefore belongs here rather than on
 * each button - it is a property of the palette, and setting it per button is how you end up with a
 * palette that is half draggable.
 */
export function SceneToolbar({ element, slots }: RegisteredComponentProps) {
    return (
        <Toolbar
            orientation={unionProperty(element.properties, 'orientation', orientations)}
            draggable={booleanProperty(element.properties, 'draggable')}
        >
            {slots.content}
        </Toolbar>
    );
}
