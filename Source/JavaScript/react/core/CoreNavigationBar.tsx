// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '../renderer';

interface NavigationBarItem {
    id: string;
    label: string;
    icon?: { library: string; key: string; variant?: string };
    destination?: { screen: string };
}

function isNavigationBarItem(value: unknown): value is NavigationBarItem {
    const candidate = value as Partial<NavigationBarItem> | null;
    return candidate !== null && typeof candidate === 'object' && typeof candidate.id === 'string' && typeof candidate.label === 'string';
}

/**
 * The `core:navigationBar` component: a list of navigation items, the first of which a template author normally
 * fixes as Home and the rest of which consumers of the template can add to.
 *
 * It reads `items` from the property bag it is given and nothing else, so it renders the same whether a screen is
 * being played or edited - configuration is resolved into the bag before it gets here. An item names its destination
 * as a screen, and activating it emits a host-neutral navigation event, the same as `core:navigate`. An item's icon
 * is carried on the node as data attributes for a host to render; icon catalogs are not this component's business.
 */
export function CoreNavigationBar({ element }: RegisteredComponentProps) {
    const items = Array.isArray(element.properties.items) ? element.properties.items.filter(isNavigationBarItem) : [];
    const title = typeof element.properties.title === 'string' ? element.properties.title : undefined;

    return (
        <nav data-scene-id={element.id} aria-label={title}>
            {items.map(item => {
                const targetScreen = item.destination?.screen ?? '';
                const navigate = () => globalThis.dispatchEvent(new CustomEvent('cratis.scene.navigate', { detail: { targetScreen, element, item } }));
                return (
                    <button
                        key={item.id}
                        type='button'
                        data-scene-item={item.id}
                        data-scene-icon-library={item.icon?.library}
                        data-scene-icon-key={item.icon?.key}
                        data-scene-icon-variant={item.icon?.variant}
                        disabled={targetScreen === ''}
                        onClick={navigate}
                    >
                        {item.label}
                    </button>
                );
            })}
        </nav>
    );
}
