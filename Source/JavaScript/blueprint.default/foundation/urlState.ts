// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useState } from 'react';

/** Reads one query-string parameter of the current address, or undefined when it is absent or there is no address (server rendering). */
export function readUrlParameter(name: string): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const value = new URLSearchParams(window.location.search).get(name);
    return value === null ? undefined : value;
}

/** Writes one query-string parameter to the address without adding a history entry; an undefined or empty value removes it. */
export function writeUrlParameter(name: string, value: string | undefined): void {
    if (typeof window === 'undefined') return;
    const parameters = new URLSearchParams(window.location.search);
    if (value === undefined || value === '') parameters.delete(name);
    else parameters.set(name, value);

    const query = parameters.toString();
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${query.length > 0 ? `?${query}` : ''}${window.location.hash}`);
}

/** The event that tells every component sharing an address parameter that it changed: replacing the address in place raises no event of its own. */
const urlStateChanged = 'cratis-foundation-url-state';

/**
 * State that lives in the address bar: a list's search, sort, page and filters, a master/detail's selection, a module's active section.
 *
 * It starts from the address when the address has a value (so a shared link, a refresh and the back button restore the screen as it was),
 * otherwise from the fallback the template supplies. Changing it rewrites the address in place and does not add a history entry per keystroke.
 * Several components on one screen use distinct `key`s; a template names them (`q`, `sort`, `page`, `selected`, `section`). Without a
 * `urlKey` the state is plain component state, which is what a gallery card and a design surface want.
 *
 * @param key The query-string parameter, or undefined to keep the state local.
 * @param fallback The value used when the address has none.
 * @returns The value and its setter.
 */
export function useUrlState(key: string | undefined, fallback: string | undefined): [string | undefined, (value: string | undefined) => void] {
    const [value, setValue] = useState<string | undefined>(() => (key === undefined ? fallback : readUrlParameter(key) ?? fallback));

    useEffect(() => {
        if (key === undefined) return;
        const restore = () => setValue(readUrlParameter(key) ?? fallback);
        // Another component on the page writing the same parameter - a search box and the list it narrows - is a change here too.
        const shared = (event: Event) => {
            const detail = (event as CustomEvent<{ key: string; value: string | undefined }>).detail;
            if (detail.key === key) setValue(detail.value ?? fallback);
        };
        window.addEventListener('popstate', restore);
        window.addEventListener(urlStateChanged, shared);
        return () => { window.removeEventListener('popstate', restore); window.removeEventListener(urlStateChanged, shared); };
    }, [key, fallback]);

    const update = useCallback((next: string | undefined) => {
        setValue(next);
        if (key === undefined) return;
        writeUrlParameter(key, next);
        window.dispatchEvent(new CustomEvent(urlStateChanged, { detail: { key, value: next } }));
    }, [key]);

    return [value, update];
}
