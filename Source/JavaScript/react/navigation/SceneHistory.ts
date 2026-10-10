// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneNavigationState } from './SceneNavigationState';

/**
 * The history a navigation host records its entries in. The browser implementation drives `window.history`,
 * so deep links, refresh and the browser's back and forward buttons work; the memory implementation keeps
 * the same stack for embedded and design-time hosts that do not own the address bar.
 */
export interface SceneHistory {
    /** The current URL relative to the base path, or undefined at the base path itself. */
    location(): string | undefined;

    /** The state stored with the current entry, if the host wrote it. */
    state(): SceneNavigationState | undefined;

    push(state: SceneNavigationState): void;
    replace(state: SceneNavigationState): void;
    back(): void;

    /** Called with the entry's URL and stored state after back or forward. Returns the unsubscribe function. */
    listen(listener: (url: string | undefined, state: SceneNavigationState | undefined) => void): () => void;
}
