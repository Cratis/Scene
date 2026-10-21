// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconButton } from '@cratis/components/Common';
import { ShellIcon } from './ShellIcon';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { LayoutMode, useLayoutConfig } from '../configuration';
import { NavigationRegionKind } from '@cratis/scene.model';
import { readBoolean } from './elementProperties';
import { RegionNavigation, useHasRegionNavigation } from './RegionNavigation';

/**
 * The fixed strip across the top of the application shell.
 *
 * It owns the one control every mode needs: the sidebar toggle. In `horizontal` mode it also hosts the
 * menu itself, which is why the menu arrives here as a slot rather than being hard-wired into the
 * sidebar - the same navigation markup has to be able to render in two places.
 *
 * When the application supplies a navigation model and the topbar has no `menu` slot of its own, the menu is the effective
 * navigation of the topbar region for the module on the page (set `regionNavigation` to false to opt out).
 *
 * The toggle hides itself in the rail modes, where there is nothing to toggle: `slim`, `slim-plus` and
 * `compact` are always showing, `reveal` and `drawer` answer to the pointer and the pin, and `horizontal`
 * has no sidebar at all. A button that does nothing is worse than no button.
 */
export function Topbar({ element, slots }: RegisteredComponentProps) {
    const { effectiveMode, config, toggleSidebar } = useLayoutConfig();
    const hasRegion = useHasRegionNavigation();
    const showsToggle = readBoolean(element, 'showToggle', true) && togglesSidebar(effectiveMode);

    return (
        <>
            <div className='layout-topbar-start' data-scene-id={element.id}>
                {showsToggle && (
                    <IconButton
                        type='button'
                        variant='ghost'
                        shape='pill'
                        className='layout-icon-button'
                        aria-label={config.isSidebarOpen ? 'Close the menu' : 'Open the menu'}
                        aria-expanded={config.isSidebarOpen}
                        icon={<ShellIcon name='bars' />}
                        onClick={toggleSidebar} />
                )}
                {slots.logo}
                {slots.start}
            </div>
            {slots.menu?.length ? slots.menu : hasRegion && readBoolean(element, 'regionNavigation', true) ? <RegionNavigation region={NavigationRegionKind.Topbar} label='Modules' /> : null}
            <div className='layout-topbar-end'>{slots.end}</div>
        </>
    );
}

function togglesSidebar(mode: LayoutMode): boolean {
    return mode === LayoutMode.Static || mode === LayoutMode.Overlay || mode === LayoutMode.Drawer;
}
