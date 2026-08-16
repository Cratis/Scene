// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScrollPanel } from 'primereact/scrollpanel';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty } from '../properties';

/**
 * The `PrimeReact:scrollPanel` component - a bounded region with themed scrollbars.
 *
 * A height is always applied: ScrollPanel with no bound grows to fit its content and never scrolls,
 * which looks like the component doing nothing at all.
 *
 * In PrimeReact 11 this component is renamed `ScrollArea`.
 */
export function PrimeScrollPanel({ element, slots }: RegisteredComponentProps) {
    return (
        <ScrollPanel
            data-scene-id={element.id}
            style={{ height: `${numberProperty(element, 'height', 200)}px`, width: '100%' }}>
            {slots.content}
        </ScrollPanel>
    );
}
