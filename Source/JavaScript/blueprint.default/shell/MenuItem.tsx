// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { readBoolean, readOptionalString, readString } from './elementProperties';

/**
 * One entry in a navigation list, optionally with a submenu.
 *
 * Its properties are deliberately the {@link NavigationItem} contract - `label`, `targetScreen`,
 * `routeParameterBindings`, `order`, `group` - so the very same element can be handed to the
 * `Navigation` contribution point and read back by `extractNavigationItem`. A screen therefore declares
 * its navigation once and gets both the sidebar entry and the aggregated navigation for free, instead of
 * maintaining a menu and a contribution that drift apart.
 *
 * The route is rendered as a hash route against the target screen's name. A host with a real router
 * renders the shell inside it and rewrites these; hashes keep the gallery navigable with no router at all,
 * which is what a preview needs.
 */
export function MenuItem({ element, slots }: RegisteredComponentProps) {
    const label = readString(element, 'label');
    const icon = readOptionalString(element, 'icon');
    const badge = readOptionalString(element, 'badge');
    const targetScreen = readOptionalString(element, 'targetScreen');
    const isActive = readBoolean(element, 'isActive');
    const hasSubmenu = (slots.items?.length ?? 0) > 0;

    return (
        <li className='layout-menu-item' data-scene-id={element.id} data-active={isActive} data-target-screen={targetScreen}>
            <a className='layout-menu-link' href={targetScreen ? `#/${targetScreen}` : undefined} aria-current={isActive ? 'page' : undefined}>
                {icon && <i className={`layout-menu-icon ${icon}`} aria-hidden='true' />}
                <span className='layout-menu-label'>{label}</span>
                {badge && <span className='layout-menu-badge'>{badge}</span>}
                {hasSubmenu && <i className='pi pi-angle-down' aria-hidden='true' />}
            </a>
            {hasSubmenu && <ul className='layout-submenu'>{slots.items}</ul>}
        </li>
    );
}
