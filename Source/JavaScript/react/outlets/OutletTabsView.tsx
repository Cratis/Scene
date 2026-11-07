// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EffectiveOutlet } from '@cratis/scene.engine';
import { OutletItemKind, OutletTab } from '@cratis/scene.model';
import { SceneElementView } from '../SceneElementView';
import { useSceneSlots } from '../navigation/SceneSlotContext';
import { useSceneRouter } from '../routing/SceneRouterContext';

export interface OutletTabsViewProps {
    /** The resolved outlet of tabs. */
    outlet: EffectiveOutlet;

    /** The id of the element that draws the outlet. */
    elementId?: string;
}

/**
 * The tab an outlet of tabs shows: the one the router says was chosen, or the first.
 * @param tabs The tabs, in order.
 * @param chosen The id of the chosen tab, if any.
 * @returns The tab, or undefined when there are none.
 */
export function chosenTab(tabs: readonly OutletTab[], chosen: string | undefined): OutletTab | undefined {
    return tabs.find(tab => tab.id === chosen) ?? tabs[0];
}

/**
 * Draws an outlet of tabs: the tabs, and below them the slot the outlet owns showing the chosen tab's screen. Choosing a
 * tab goes through the router (`selectTab`), so a routed host makes the chosen tab a route segment and a shared link opens
 * the same tab.
 */
export function OutletTabsView({ outlet, elementId }: OutletTabsViewProps) {
    const router = useSceneRouter();
    const screens = useSceneSlots();
    const tabs = outlet.items.map(entry => entry.item).filter((item): item is OutletTab => item.kind === OutletItemKind.Tab);
    const chosen = chosenTab(tabs, router.state.tabs[outlet.name]);
    const slot = outlet.slot ?? outlet.name;
    const panel = `${elementId ?? outlet.name}-panel`;
    const screen = chosen && screens ? screens.screens[chosen.shows] : undefined;

    return <div data-scene-outlet={outlet.name} data-scene-outlet-kind={outlet.kind} data-scene-id={elementId} className='scene-outlet scene-outlet-tabs'>
        <div role='tablist' aria-label={outlet.name} className='scene-outlet-tablist'>
            {tabs.map(tab => <button key={tab.id} type='button' role='tab' id={`${panel}-${tab.id}`} aria-selected={tab === chosen} aria-controls={panel}
                data-scene-outlet-item={tab.id} className='scene-outlet-tab' onClick={() => router.selectTab(outlet.name, tab.id)}>{tab.title}</button>)}
        </div>
        <div role='tabpanel' id={panel} aria-labelledby={chosen ? `${panel}-${chosen.id}` : undefined} data-scene-slot={slot} data-scene-slot-screen={chosen?.shows} className='scene-outlet-tabpanel'>
            {screen && screens && <SceneElementView element={screen} registry={screens.registry} />}
        </div>
    </div>;
}
