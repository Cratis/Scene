// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneBrowserWindow } from './createBrowserSceneHistory';
import { SceneHistory } from './SceneHistory';
import { SceneNavigationState } from './SceneNavigationState';

const stateKey = 'sceneNavigation';

/**
 * A history kept in the URL fragment - `index.html#/WorkItemDetails?workItemId=B` - for hosts that are served
 * as a single file or from a path they do not control, such as a generated runtime or a webview. It behaves
 * like `createBrowserSceneHistory`: entries are pushed with their navigation state, back and forward restore
 * them, and a typed or bookmarked fragment is matched by URL alone. A fragment changed by hand, which fires
 * `hashchange` rather than `popstate`, is reported the same way.
 */
export function createHashSceneHistory(browser: SceneBrowserWindow = window): SceneHistory {
    const location = () => {
        const fragment = browser.location.hash.replace(/^#\/?/, '');
        return fragment.length ? fragment : undefined;
    };
    const href = (url: string | undefined) => `${browser.location.pathname}${browser.location.search}#/${url ?? ''}`;
    const stored = (value: unknown) => (value as Record<string, SceneNavigationState> | null)?.[stateKey];

    return {
        location,
        state: () => stored(browser.history.state),
        push: state => browser.history.pushState({ [stateKey]: state }, '', href(state.url)),
        replace: state => browser.history.replaceState({ [stateKey]: state }, '', href(state.url)),
        back: () => browser.history.back(),
        listen: listener => {
            const onPopState = (event: PopStateEvent) => listener(location(), stored(event.state));
            const onHashChange = () => listener(location(), stored(browser.history.state));
            browser.addEventListener('popstate', onPopState);
            browser.addEventListener('hashchange', onHashChange);
            return () => {
                browser.removeEventListener('popstate', onPopState);
                browser.removeEventListener('hashchange', onHashChange);
            };
        },
    };
}
