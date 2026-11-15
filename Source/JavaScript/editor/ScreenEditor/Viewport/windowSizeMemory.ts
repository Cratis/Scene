// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ViewportSize } from './ViewportSize';

// Where the sizes are kept: the part of the browser's storage a window needs, so a host can give it something else and a spec can give it nothing.
export interface WindowSizeStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

// What the editor remembers about its window, per person and per browser: a size for each screen, and the last size used for any. It is kept
// outside the screen. The window is a way of looking at a screen, not part of what the screen is, so nothing here is saved into the document or
// reaches the runtime content.
export interface WindowSizeMemory {
    read(screen: string): ViewportSize | undefined;
    write(screen: string, size: ViewportSize): void;
    readLastUsed(): ViewportSize | undefined;
}

const prefix = 'studio.screenEditor.windowSize.v1';
const lastUsedKey = `${prefix}:last`;

const parse = (text: string | null): ViewportSize | undefined => {
    if (text === null) return undefined;
    try {
        const value = JSON.parse(text) as Partial<ViewportSize> | null;
        return value && typeof value.width === 'number' && typeof value.height === 'number' && value.width > 0 && value.height > 0 && Number.isFinite(value.width) && Number.isFinite(value.height)
            ? { width: value.width, height: value.height }
            : undefined;
    } catch {
        return undefined;
    }
};

// Storage can be missing (a server render), blocked (private browsing, a policy) or full; the window then simply forgets, as it always did.
const attempt = <T>(action: () => T): T | undefined => {
    try {
        return action();
    } catch {
        return undefined;
    }
};

export const browserWindowSizeStorage = (): WindowSizeStorage | undefined =>
    attempt(() => (typeof window !== 'undefined' ? window.localStorage : undefined));

export function createWindowSizeMemory(storage: WindowSizeStorage | undefined = browserWindowSizeStorage()): WindowSizeMemory {
    return {
        read: screen => storage ? parse(attempt(() => storage.getItem(`${prefix}:${screen}`)) ?? null) : undefined,
        write: (screen, size) => {
            if (!storage) return;
            const text = JSON.stringify({ width: Math.round(size.width), height: Math.round(size.height) });
            attempt(() => { storage.setItem(`${prefix}:${screen}`, text); storage.setItem(lastUsedKey, text); });
        },
        readLastUsed: () => storage ? parse(attempt(() => storage.getItem(lastUsedKey)) ?? null) : undefined,
    };
}
