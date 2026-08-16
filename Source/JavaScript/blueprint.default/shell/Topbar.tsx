// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Button } from 'primereact/button';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { LayoutMode, useLayoutConfig } from '../configuration';
import { readBoolean } from './elementProperties';

/**
 * The fixed strip across the top of the application shell.
 *
 * It owns the one control every mode needs: the sidebar toggle. In `horizontal` mode it also hosts the
 * menu itself, which is why the menu arrives here as a slot rather than being hard-wired into the
 * sidebar - the same navigation markup has to be able to render in two places.
 *
 * The toggle hides itself in the rail modes, where there is nothing to toggle: `slim`, `slim-plus` and
 * `compact` are always showing, `reveal` and `drawer` answer to the pointer and the pin, and `horizontal`
 * has no sidebar at all. A button that does nothing is worse than no button.
 */
export function Topbar({ element, slots }: RegisteredComponentProps) {
    const { effectiveMode, config, toggleSidebar } = useLayoutConfig();
    const showsToggle = readBoolean(element, 'showToggle', true) && togglesSidebar(effectiveMode);

    return (
        <>
            <div className='layout-topbar-start' data-scene-id={element.id}>
                {showsToggle && (
                    <Button
                        type='button'
                        variant='text'
                        rounded
                        iconOnly
                        aria-label={config.isSidebarOpen ? 'Close the menu' : 'Open the menu'}
                        aria-expanded={config.isSidebarOpen}
                        onClick={toggleSidebar}>
                        <i className='pi pi-bars' aria-hidden='true' />
                    </Button>
                )}
                {slots.logo}
                {slots.start}
            </div>
            {slots.menu}
            <div className='layout-topbar-end'>{slots.end}</div>
        </>
    );
}

function togglesSidebar(mode: LayoutMode): boolean {
    return mode === LayoutMode.Static || mode === LayoutMode.Overlay;
}
