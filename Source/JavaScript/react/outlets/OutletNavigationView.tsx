// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useContext } from 'react';
import { EffectiveOutlet } from '@cratis/scene.engine';
import { DestinationReference, OutletItemKind, OutletNavigationItem } from '@cratis/scene.model';
import { SceneNavigationContextInternal } from '../navigation/SceneNavigationContext';

export interface OutletNavigationViewProps {
    /** The resolved outlet of navigation. */
    outlet: EffectiveOutlet;

    /** The id of the element that draws the outlet. */
    elementId?: string;
}

/**
 * Where choosing a navigation item goes: its target, opened in the slot the item names when it names one.
 * @param item The navigation item.
 * @returns The destination, or undefined when the item has no target - a heading for its sub-items.
 */
export function navigationItemTarget(item: OutletNavigationItem): DestinationReference | undefined {
    if (!item.target) return undefined;
    return item.slot !== undefined && item.target.slot === undefined ? { ...item.target, slot: item.slot } : item.target;
}

interface ItemsProps {
    items: OutletNavigationItem[];
    current?: string;
    navigate(destination: DestinationReference, item: OutletNavigationItem): void;
}

function Items({ items, current, navigate }: ItemsProps) {
    return <ul className='scene-outlet-navigation-list'>
        {items.map(item => {
            const target = navigationItemTarget(item);
            const active = target?.screen !== undefined && target.screen === current;
            return <li key={item.id} data-scene-outlet-item={item.id}>
                {target
                    ? <button type='button' className='scene-outlet-navigation-item' aria-current={active ? 'page' : undefined} onClick={() => navigate(target, item)}>
                        {item.icon && <span aria-hidden='true' data-scene-icon-name={item.icon} />}
                        {item.title}
                    </button>
                    : <span className='scene-outlet-navigation-heading'>
                        {item.icon && <span aria-hidden='true' data-scene-icon-name={item.icon} />}
                        {item.title}
                    </span>}
                {item.children && item.children.length > 0 && <Items items={item.children} current={current} navigate={navigate} />}
            </li>;
        })}
    </ul>;
}

/**
 * Draws an outlet of navigation: each item's title and icon, its sub-items nested below it, and the item of the current
 * screen marked. Choosing an item navigates to its target - in the slot the item names - through the navigation host, or
 * announces it with `cratis.scene.navigate` outside one.
 */
export function OutletNavigationView({ outlet, elementId }: OutletNavigationViewProps) {
    const navigation = useContext(SceneNavigationContextInternal);
    const items = outlet.items.map(entry => entry.item).filter((item): item is OutletNavigationItem => item.kind === OutletItemKind.Navigation);
    const navigate = (destination: DestinationReference, item: OutletNavigationItem) => {
        if (navigation) {
            navigation.navigate(destination);
            return;
        }
        globalThis.dispatchEvent(new CustomEvent('cratis.scene.navigate', {
            detail: { targetScreen: destination.screen ?? '', destination, element: elementId, item: item.id },
        }));
    };

    return <nav aria-label={outlet.name} data-scene-outlet={outlet.name} data-scene-outlet-kind={outlet.kind} data-scene-id={elementId} className='scene-outlet scene-outlet-navigation'>
        <Items items={items} current={navigation?.currentScreen} navigate={navigate} />
    </nav>;
}
