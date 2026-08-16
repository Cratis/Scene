// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button } from 'primereact/button';
import { Drawer } from 'primereact/drawer';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:sidebar` component - a panel that slides in from an edge of the viewport.
 *
 * **This is built on `primereact/drawer`, and that is not a mistake.** PrimeReact 11 renamed this
 * component to `Drawer` *and* introduced an unrelated new component under the name `Sidebar` -
 * `primereact/sidebar` in v11 is an application-shell primitive (`SidebarLayout`, `SidebarAside`,
 * `SidebarPanel`, `SidebarMenu` and friends) for persistent navigation, with no slide-in overlay
 * behavior anywhere in it. Importing `Sidebar` from v11 to port a v10 `Sidebar` compiles perfectly and
 * silently replaces a dismissable overlay with a static shell element, which is why the module here is
 * the one that does not match the name. The abstract Scene name stays `sidebar` so existing screens keep
 * resolving; only the implementation moved.
 *
 * Visibility is owned locally and a trigger is always rendered, for the reason described on
 * {@link PrimeDialog}, and v11's controlled `open` / `onOpenChange` pair is wired for the reason
 * described there too.
 *
 * v10's `fullScreen` flag became a fifth `position` value rather than a separate prop, so the two Scene
 * properties collapse into one: `fullScreen` wins when set, since a drawer covering the viewport has no
 * edge left to slide in from.
 */
export function PrimeSidebar({ element, slots }: RegisteredComponentProps) {
    const [visible, setVisible] = useState(booleanProperty(element, 'visible', false));
    const position = booleanProperty(element, 'fullScreen', false) ? 'full' : stringProperty(element, 'position', 'left');
    return (
        <div data-scene-id={element.id}>
            <Button onClick={() => setVisible(true)}>{stringProperty(element, 'triggerLabel', 'Open')}</Button>
            <Drawer.Root
                open={visible}
                position={position as 'left' | 'right' | 'top' | 'bottom' | 'full'}
                onOpenChange={(event) => {
                    if (!event.value) setVisible(false);
                }}>
                <Drawer.Portal>
                    <Drawer.Backdrop />
                    <Drawer.Popup>
                        <Drawer.Header>
                            <Drawer.Title>{stringProperty(element, 'header')}</Drawer.Title>
                            <Drawer.Close aria-label='Close'>
                                <i className='pi pi-times' />
                            </Drawer.Close>
                        </Drawer.Header>
                        <Drawer.Content>{slots.content}</Drawer.Content>
                    </Drawer.Popup>
                </Drawer.Portal>
            </Drawer.Root>
        </div>
    );
}
