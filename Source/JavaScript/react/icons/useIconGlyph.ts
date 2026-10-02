// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useState } from 'react';
import { IconReference } from '@cratis/scene.model';
import { IconAdapter, IconGlyph } from './IconAdapter';
import { IconAdapterRegistry } from './IconAdapterRegistry';

/**
 * Where loading one icon's artwork stands.
 */
export type IconGlyphState =
    | { status: 'loading' }
    | { status: 'ready'; glyph: IconGlyph }
    | { status: 'unavailable'; reason: string };

const loads = new WeakMap<IconAdapter, Map<string, Promise<IconGlyph | undefined>>>();

function keyOf(reference: IconReference): string {
    return JSON.stringify([reference.key, reference.variant ?? null]);
}

/**
 * One load per adapter and icon, shared between every place the icon is drawn; a failed load is
 * forgotten so the next render can try again.
 */
function load(adapter: IconAdapter, reference: IconReference): Promise<IconGlyph | undefined> {
    let perAdapter = loads.get(adapter);
    if (!perAdapter) {
        perAdapter = new Map();
        loads.set(adapter, perAdapter);
    }

    const key = keyOf(reference);
    let pending = perAdapter.get(key);
    if (!pending) {
        pending = Promise.resolve().then(() => adapter.loadGlyph(reference));
        perAdapter.set(key, pending);
        pending.catch(() => perAdapter.delete(key));
    }

    return pending;
}

/**
 * Loads the artwork for a reference through the adapter registered for its library. An absent registry,
 * a library with no adapter, an icon the library lacks and a failed load are all `unavailable`, each with
 * its reason - never a different icon.
 */
export function useIconGlyph(reference: IconReference, adapters: IconAdapterRegistry | undefined): IconGlyphState {
    const [state, setState] = useState<IconGlyphState>({ status: 'loading' });
    const { library, key, variant } = reference;

    useEffect(() => {
        let isCurrent = true;
        const adapter = adapters?.get(library);
        if (!adapter) {
            setState({ status: 'unavailable', reason: `No icon adapter is registered for the library '${library}'` });
            return;
        }

        setState({ status: 'loading' });
        load(adapter, { library, key, variant }).then(
            (glyph) => {
                if (!isCurrent) return;
                setState(glyph ? { status: 'ready', glyph } : { status: 'unavailable', reason: `The library '${library}' has no icon '${key}'` });
            },
            (error: unknown) => {
                if (isCurrent) setState({ status: 'unavailable', reason: error instanceof Error ? error.message : String(error) });
            }
        );

        return () => {
            isCurrent = false;
        };
    }, [adapters, library, key, variant]);

    return state;
}
