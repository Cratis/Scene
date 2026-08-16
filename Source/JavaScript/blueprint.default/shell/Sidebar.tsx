// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Button } from 'primereact/button';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { isPointerRevealMode, useLayoutConfig } from '../configuration';
import { readString } from './elementProperties';

/**
 * The sidebar's own chrome, inside the panel {@link AppShell} positions.
 *
 * The panel and its contents are deliberately different components. Everything about *where* the sidebar
 * is - translated off-canvas, collapsed to a rail, growing on hover - belongs to the mode and therefore to
 * the shell; everything about *what is in it* belongs to the screen. A template can replace this header
 * wholesale without any of the mode CSS noticing.
 *
 * The pin button only appears in `reveal` and `drawer`, the two modes where the sidebar answers to the
 * pointer and therefore needs a way to be made to stay.
 */
export function Sidebar({ element, slots }: RegisteredComponentProps) {
    const { effectiveMode, config, toggleSidebarAnchor } = useLayoutConfig();
    const title = readString(element, 'title');
    const isPinnable = isPointerRevealMode(effectiveMode);

    return (
        <>
            <div className='layout-sidebar-header' data-scene-id={element.id}>
                {slots.logo}
                {title && <span className='layout-sidebar-title'>{title}</span>}
                {isPinnable && (
                    <Button
                        type='button'
                        variant='text'
                        rounded
                        iconOnly
                        aria-label={config.isSidebarAnchored ? 'Unpin the menu' : 'Pin the menu open'}
                        aria-pressed={config.isSidebarAnchored}
                        onClick={toggleSidebarAnchor}>
                        <i className={config.isSidebarAnchored ? 'pi pi-lock' : 'pi pi-lock-open'} aria-hidden='true' />
                    </Button>
                )}
            </div>
            {slots.content}
        </>
    );
}
