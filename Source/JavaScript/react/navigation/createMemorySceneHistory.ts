// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneHistory } from './SceneHistory';
import { SceneNavigationState } from './SceneNavigationState';

/**
 * A history kept in memory with the same push, replace and back semantics as the browser's: pushing
 * discards any forward entries, and going back notifies listeners. `forward` is exposed for hosts and specs
 * that drive the stack themselves.
 */
export function createMemorySceneHistory(initialUrl?: string): SceneHistory & { forward(): void; entries(): SceneNavigationState[] } {
    const entries: { url?: string; state?: SceneNavigationState }[] = [{ url: initialUrl }];
    let index = 0;
    const listeners = new Set<(url: string | undefined, state: SceneNavigationState | undefined) => void>();
    const notify = () => listeners.forEach(listener => listener(entries[index].url, entries[index].state));

    return {
        location: () => entries[index].url,
        state: () => entries[index].state,
        push: state => {
            entries.splice(index + 1, entries.length, { url: state.url, state });
            index = entries.length - 1;
        },
        replace: state => {
            entries[index] = { url: state.url, state };
        },
        back: () => {
            if (index === 0) return;
            index--;
            notify();
        },
        forward: () => {
            if (index === entries.length - 1) return;
            index++;
            notify();
        },
        entries: () => entries.map(entry => entry.state).filter((state): state is SceneNavigationState => state !== undefined),
        listen: listener => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}
