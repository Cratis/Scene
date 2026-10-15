// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, useMemo, useState } from 'react';
import { BindingScope } from '@cratis/scene.engine';
import { DestinationReference, SceneElement } from '@cratis/scene.model';
import { SceneElementView } from '../SceneElementView';
import { ComponentRegistry } from '../renderer';
import { createMemorySceneHistory } from './createMemorySceneHistory';
import { SceneHistory } from './SceneHistory';
import { SceneNavigationProvider } from './SceneNavigationContext';
import { SceneRoute } from './SceneRoute';
import { sceneRoutesFrom } from './sceneRoutesFrom';
import { collectOutletOwners } from './collectOutletOwners';
import { SceneOutletContext } from './SceneOutletContext';
import { useSceneHistoryNavigation } from './useSceneHistoryNavigation';
import { SceneNavigationModel } from './region/SceneNavigationModel';
import { SceneNavigationModelProvider } from './region/SceneNavigationModelContext';
import { navigationDestinations } from './region/navigationDestinations';

export interface SceneNavigationHostProps {
    screens: Record<string, SceneElement>;
    dialogs?: Record<string, SceneElement>;
    initialScreen: string;
    registry: ComponentRegistry;
    bindingScope?: BindingScope;

    /**
     * Where entries are recorded. `createBrowserSceneHistory()` drives the address bar, so deep links,
     * refresh and back/forward work; the default is an in-memory history for embedded hosts.
     */
    history?: SceneHistory;

    /** The destinations the application navigates to, so their route overrides can be deep linked. */
    destinations?: DestinationReference[];

    /**
     * The application's structure and navigation. Navigation regions rendered inside the host (`NavigationRegionView`) read it,
     * and - when `destinations` is not given - the destinations of every navigation item become the deep-linkable ones.
     */
    navigationModel?: SceneNavigationModel;

    /**
     * Wraps the primary outlet in the application's chrome - a topbar, a sidebar, a toolbar. The chrome is part of the host,
     * so it stays mounted while the screens inside it change and navigation regions keep their state.
     */
    frame?(content: ReactNode): ReactNode;

    /** An explicit route table, used instead of the one derived from `screens` and `destinations`. */
    routes?: SceneRoute[];
}

/**
 * Executes Scene destinations against an in-memory rendered hierarchy: a destination into a nested outlet -
 * one a screen declares with `core:outlet` - places its screen there and keeps the screens above it, to any
 * depth; any other screen route replaces the primary region,
 * dialog destinations render dialog content over the screen that opened them, and external destinations
 * only report their resolved action. Every navigation is a history entry.
 */
export function SceneNavigationHost({ screens, dialogs = {}, initialScreen, registry, bindingScope = {}, history, destinations: authoredDestinations, routes, navigationModel, frame }: SceneNavigationHostProps) {
    const destinations = useMemo(
        () => authoredDestinations ?? (navigationModel ? navigationDestinations(navigationModel.structure, navigationModel.navigation, navigationModel.screenFor) : undefined),
        [authoredDestinations, navigationModel]);
    const [memoryHistory] = useState(() => createMemorySceneHistory());
    const routeTable = useMemo(() => routes ?? sceneRoutesFrom(Object.keys(screens), destinations), [destinations, routes, screens]);
    const outletOwners = useMemo(() => collectOutletOwners(screens), [screens]);
    const value = useSceneHistoryNavigation(history ?? memoryHistory, routeTable, initialScreen, bindingScope, outletOwners, destinations);
    const outletContext = useMemo(() => ({ screens, registry }), [registry, screens]);

    const screen = screens[value.primaryScreen];
    const dialog = value.currentDialog ? dialogs[value.currentDialog] : undefined;

    const outlet = <div data-scene-outlet={value.primaryScreen === value.currentScreen ? value.currentOutlet ?? 'primary' : 'primary'} data-scene-url={value.currentUrl}>
        {screen && <SceneElementView element={screen} registry={registry} dataContext={bindingScope.dataContext} queryResults={bindingScope.queryResults} componentOutputs={bindingScope.componentOutputs} />}
    </div>;
    const page = <SceneNavigationProvider value={value}><SceneOutletContext.Provider value={outletContext}>
        {frame ? frame(outlet) : outlet}
        {dialog && <div role='dialog' aria-modal='true' aria-label={value.currentDialog} data-scene-dialog={value.currentDialog}>
            <SceneElementView element={dialog} registry={registry} dataContext={bindingScope.dataContext} queryResults={bindingScope.queryResults} componentOutputs={bindingScope.componentOutputs} />
        </div>}
    </SceneOutletContext.Provider></SceneNavigationProvider>;

    return navigationModel ? <SceneNavigationModelProvider model={navigationModel}>{page}</SceneNavigationModelProvider> : page;
}
