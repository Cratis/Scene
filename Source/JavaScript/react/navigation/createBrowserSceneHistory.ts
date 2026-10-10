// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneHistory } from './SceneHistory';
import { SceneNavigationState } from './SceneNavigationState';

/** The part of `window` the browser history needs, so a host can pass its own frame's window. */
export type SceneBrowserWindow = Pick<Window, 'history' | 'location' | 'addEventListener' | 'removeEventListener'>;

const stateKey = 'sceneNavigation';

/**
 * A history backed by the browser's `history` API under a base path such as `/app/`. Entries carry their
 * navigation state, so back and forward restore the screen, outlet, parameters and dialog without
 * re-resolving; an entry without state - a typed or bookmarked URL - is reported by URL alone.
 */
export function createBrowserSceneHistory(browser: SceneBrowserWindow = window, basePath = '/'): SceneHistory {
    const base = basePath.endsWith('/') ? basePath : `${basePath}/`;
    const href = (url: string | undefined) => `${base}${url ?? ''}`;
    const location = () => {
        const current = `${browser.location.pathname}${browser.location.search}`;
        if (!current.startsWith(base)) return undefined;
        const relative = current.substring(base.length);
        return relative.length ? relative : undefined;
    };
    const stored = (value: unknown) => (value as Record<string, SceneNavigationState> | null)?.[stateKey];

    return {
        location,
        state: () => stored(browser.history.state),
        push: state => browser.history.pushState({ [stateKey]: state }, '', href(state.url)),
        replace: state => browser.history.replaceState({ [stateKey]: state }, '', href(state.url)),
        back: () => browser.history.back(),
        listen: listener => {
            const onPopState = (event: PopStateEvent) => listener(location(), stored(event.state));
            browser.addEventListener('popstate', onPopState);
            return () => browser.removeEventListener('popstate', onPopState);
        },
    };
}
