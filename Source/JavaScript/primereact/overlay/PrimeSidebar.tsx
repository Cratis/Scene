// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:sidebar` component - a panel that slides in from an edge of the viewport.
 *
 * Worth knowing before a PrimeReact 11 port: v11 renames this component to `Drawer` *and* introduces an
 * unrelated new component called `Sidebar` for application-shell navigation. A port that follows the
 * name rather than the behavior silently swaps a slide-in overlay for a static shell element.
 */
export function PrimeSidebar({ element, slots }: RegisteredComponentProps) {
    const [visible, setVisible] = useState(booleanProperty(element, 'visible', false));
    return (
        <div data-scene-id={element.id}>
            <Button label={stringProperty(element, 'triggerLabel', 'Open')} onClick={() => setVisible(true)} />
            <Sidebar
                visible={visible}
                onHide={() => setVisible(false)}
                position={stringProperty(element, 'position', 'left') as 'left' | 'right' | 'top' | 'bottom'}
                fullScreen={booleanProperty(element, 'fullScreen', false)}>
                {slots.content}
            </Sidebar>
        </div>
    );
}
