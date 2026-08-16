// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScrollArea } from 'primereact/scrollarea';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty } from '../properties';

/**
 * The `PrimeReact:scrollPanel` component - a bounded region with themed scrollbars.
 *
 * A height is always applied: a scroll area with no bound grows to fit its content and never scrolls,
 * which looks like the component doing nothing at all.
 *
 * PrimeReact 11 renamed `ScrollPanel` to `ScrollArea` and split it into parts. The viewport, the content
 * wrapper and the scrollbar are all rendered here rather than by the component, because v11 renders no
 * part it was not given - a `ScrollArea.Root` on its own clips nothing and shows no bar. Only the
 * vertical scrollbar is composed in, matching the fixed-height-and-full-width shape this adapter imposes;
 * the part hides itself when the content happens to fit, so it costs nothing when it is not needed. The
 * abstract Scene name stays `scrollPanel` so existing screens keep resolving.
 */
export function PrimeScrollPanel({ element, slots }: RegisteredComponentProps) {
    return (
        <ScrollArea.Root data-scene-id={element.id} style={{ height: `${numberProperty(element, 'height', 200)}px`, width: '100%' }}>
            <ScrollArea.Viewport>
                <ScrollArea.Content>{slots.content}</ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation='vertical'>
                <ScrollArea.Handle />
            </ScrollArea.Scrollbar>
        </ScrollArea.Root>
    );
}
