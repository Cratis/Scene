// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { readBoolean, readOptionalString, readString } from './elementProperties';
import { useShellLink } from './useShellLink';

/**
 * One entry in a navigation list, optionally with a submenu.
 *
 * Its properties are deliberately the {@link NavigationItem} contract - `label`, `targetScreen`,
 * `routeParameterBindings`, `order`, `group` - so the very same element can be handed to the
 * `Navigation` contribution point and read back by `extractNavigationItem`. A screen therefore declares
 * its navigation once and gets both the sidebar entry and the aggregated navigation for free, instead of
 * maintaining a menu and a contribution that drift apart.
 *
 * Inside a navigation host (the preview host, Stage) the entry navigates through the host's navigation context: a click renders
 * the target screen in the primary region, the entry is current while that screen is on the page, and the address of the page
 * hosting the application is never written. An entry whose target is not a screen the host renders is drawn with the warning
 * marker (`data-nav-problem`). Outside a host the entry is an ordinary hash link and `isActive` states what is current, which is
 * what a Storybook story or a static render needs.
 */
export function MenuItem({ element, slots }: RegisteredComponentProps) {
    const label = readString(element, 'label');
    const icon = readOptionalString(element, 'icon');
    const badge = readOptionalString(element, 'badge');
    const targetScreen = readOptionalString(element, 'targetScreen');
    const hasSubmenu = (slots.items?.length ?? 0) > 0;
    const link = useShellLink(targetScreen, { source: 'menu', id: element.id, label });
    const isActive = link.current ?? readBoolean(element, 'isActive');
    const dead = link.dead && !hasSubmenu;

    return (
        <li className='layout-menu-item' data-scene-id={element.id} data-active={isActive} data-target-screen={targetScreen} data-scene-iconless={icon ? undefined : 'true'} data-nav-problem={dead ? 'navTargetMissing' : undefined}>
            <a className='layout-menu-link' href={link.href ?? (targetScreen ? `#/${targetScreen}` : undefined)} aria-current={isActive ? 'page' : undefined} onClick={link.onClick}
                title={dead ? 'This entry has no target to go to.' : undefined}>
                {icon && <i className={`layout-menu-icon ${icon}`} aria-hidden='true' />}
                <span className='layout-menu-label'>{label}</span>
                {badge && <span className='layout-menu-badge'>{badge}</span>}
                {hasSubmenu && <i className='pi pi-angle-down' aria-hidden='true' />}
            </a>
            {hasSubmenu && <ul className='layout-submenu'>{slots.items}</ul>}
        </li>
    );
}
