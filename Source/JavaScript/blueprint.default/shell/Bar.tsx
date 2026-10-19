// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { NavigationRegionKind } from '@cratis/scene.model';
import { readBoolean } from './elementProperties';
import { RegionNavigation, useHasRegionNavigation } from './RegionNavigation';

/**
 * The `bar` component: a horizontal bar across the top of a page that an application's own shell fills - a storefront's brand,
 * navigation, search, basket and account.
 *
 * Where the `topbar` is the strip of the blueprint's application shell, positioned and sized by it, the bar stands on its own: it
 * needs no sidebar, no layout configuration and no fixed positioning, so a root template an application declares itself can put it in
 * any slot. The `start` slot holds the brand, the `end` slot the actions (search, a count button, the account menu), and the middle
 * is the `center` slot - or, when it is empty and the application supplies a navigation model, the effective navigation of the topbar
 * region for the module on the page (set `regionNavigation` to false to opt out).
 */
export function Bar({ element, slots }: RegisteredComponentProps) {
    const hasRegion = useHasRegionNavigation();
    const showsRegion = readBoolean(element, 'regionNavigation', true) && hasRegion;

    return (
        <header className='shell-bar layout-horizontal' data-scene-id={element.id}>
            <div className='shell-bar-start'>{slots.start}</div>
            <div className='shell-bar-center'>
                {slots.center?.length ? slots.center : showsRegion ? <RegionNavigation region={NavigationRegionKind.Topbar} label='Modules' /> : null}
            </div>
            <div className='shell-bar-end'>{slots.end}</div>
        </header>
    );
}
