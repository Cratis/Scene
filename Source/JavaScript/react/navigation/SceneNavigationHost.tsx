// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import { BindingScope } from '@cratis/scene.engine';
import { DestinationReference, SceneElement } from '@cratis/scene.model';
import { SceneElementView } from '../SceneElementView';
import { ComponentRegistry } from '../renderer';
import { createMemorySceneHistory } from './createMemorySceneHistory';
import { SceneHistory } from './SceneHistory';
import { SceneNavigationProvider } from './SceneNavigationContext';
import { SceneRoute } from './SceneRoute';
import { sceneRoutesFrom } from './sceneRoutesFrom';
import { useSceneHistoryNavigation } from './useSceneHistoryNavigation';

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

    /** An explicit route table, used instead of the one derived from `screens` and `destinations`. */
    routes?: SceneRoute[];
}

/**
 * Executes Scene destinations against an in-memory rendered hierarchy: screen routes replace outlets,
 * dialog destinations render dialog content over the screen that opened them, and external destinations
 * only report their resolved action. Every navigation is a history entry.
 */
export function SceneNavigationHost({ screens, dialogs = {}, initialScreen, registry, bindingScope = {}, history, destinations, routes }: SceneNavigationHostProps) {
    const [memoryHistory] = useState(() => createMemorySceneHistory());
    const routeTable = useMemo(() => routes ?? sceneRoutesFrom(Object.keys(screens), destinations), [destinations, routes, screens]);
    const value = useSceneHistoryNavigation(history ?? memoryHistory, routeTable, initialScreen, bindingScope);

    const screen = screens[value.currentScreen];
    const dialog = value.currentDialog ? dialogs[value.currentDialog] : undefined;

    return <SceneNavigationProvider value={value}>
        <div data-scene-outlet={value.currentOutlet ?? 'primary'} data-scene-url={value.currentUrl}>
            {screen && <SceneElementView element={screen} registry={registry} dataContext={bindingScope.dataContext} queryResults={bindingScope.queryResults} componentOutputs={bindingScope.componentOutputs} />}
        </div>
        {dialog && <div role='dialog' aria-modal='true' aria-label={value.currentDialog} data-scene-dialog={value.currentDialog}>
            <SceneElementView element={dialog} registry={registry} dataContext={bindingScope.dataContext} queryResults={bindingScope.queryResults} componentOutputs={bindingScope.componentOutputs} />
        </div>}
    </SceneNavigationProvider>;
}
