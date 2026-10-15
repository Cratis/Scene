// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EffectiveNavItem, primarySlot } from '@cratis/scene.engine';
import { defaultScreenFor } from './navigationItemDestination';
import { SceneNavigationContextValue } from '../SceneNavigationContext';

/** Where the navigation host is: the part of {@link SceneNavigationContextValue} that says what is on the page. */
export type NavigationPlacement = Pick<SceneNavigationContextValue, 'primaryScreen' | 'outlets'>;

/**
 * Whether a navigation item is the one the page shows.
 *
 * An item is active when the screen it opens is the one in the slot it renders into: the primary region for the
 * `content` slot, the nested outlet of that name otherwise. So several items can be active at once - each is shown in
 * its own slot - and closing a slot's screen un-highlights its item. With `matchModule` - a topbar - an item that targets
 * a module without a feature is also active while any screen of that module is in its slot.
 *
 * @param item The effective item.
 * @param placement What the host currently shows.
 * @param screenFor Names the screen an item opens; the feature the item resolves to when absent.
 * @param matchModule Whether a module item is active on any screen of the module; a topbar's are, a sidebar's are not.
 */
export function navigationItemActive(
    item: EffectiveNavItem,
    placement: NavigationPlacement,
    screenFor: (item: EffectiveNavItem) => string | undefined = defaultScreenFor,
    matchModule = false,
): boolean {
    const screen = screenFor(item);
    if (screen === undefined) return false;

    const shown = item.slot === primarySlot ? placement.primaryScreen : placement.outlets[item.slot];
    if (shown === undefined) return false;
    if (shown === screen) return true;

    const target = item.target;
    return matchModule && target !== undefined && target.feature === undefined && shown.startsWith(`${target.module}.`);
}
