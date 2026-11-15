// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useState } from 'react';
import { EffectiveIconCatalog, EffectiveIconEntry, IconDiagnostic } from '@cratis/scene.engine';
import { IconAdapterRegistry } from '@cratis/scene.react';
import { IconPickerCatalogState } from './IconPickerCatalogState';
import { UseIconPickerCatalogResult } from './UseIconPickerCatalogResult';
import { toIconPickerCatalog } from './toIconPickerCatalog';

interface Loaded {
    source: EffectiveIconCatalog;
    entries: EffectiveIconEntry[];
    diagnostics: IconDiagnostic[];
    error?: string;
}

function stateOf(loaded: Loaded): IconPickerCatalogState {
    if (loaded.error) return { status: 'error', error: loaded.error };
    return loaded.diagnostics.some(diagnostic => diagnostic.kind === 'catalog-unavailable') ? { status: 'error' } : { status: 'ready' };
}

// Loads an effective icon catalog for the picker.
//
// Every library's catalog is read once - Scene caches it - and the picker is given a `loading` catalog
// until then, so opening it never blocks on a large library. A library whose catalog fails shows up in
// `diagnostics` and puts the picker into its error state while the others stay browsable; a failure of
// the whole load carries its message through the catalog's `error`.
export function useIconPickerCatalog(catalog: EffectiveIconCatalog, adapters?: IconAdapterRegistry): UseIconPickerCatalogResult {
    const [loaded, setLoaded] = useState<Loaded | undefined>();
    const [loadedVersion, setLoadedVersion] = useState(0);

    useEffect(() => {
        let isCurrent = true;
        catalog
            .search()
            .then(result => {
                if (!isCurrent) return;
                setLoaded({ source: catalog, entries: result.entries, diagnostics: [...catalog.diagnostics, ...result.diagnostics] });
                setLoadedVersion(version => version + 1);
            })
            .catch((error: unknown) => {
                if (!isCurrent) return;
                setLoaded({ source: catalog, entries: [], diagnostics: catalog.diagnostics, error: error instanceof Error ? error.message : String(error) });
                setLoadedVersion(version => version + 1);
            });

        return () => {
            isCurrent = false;
        };
    }, [catalog]);

    return useMemo(() => {
        const current = loaded?.source === catalog ? loaded : undefined;
        const state = current ? stateOf(current) : { status: 'loading' as const };

        return {
            catalog: toIconPickerCatalog(catalog, current?.entries ?? [], adapters, state),
            diagnostics: current?.diagnostics ?? catalog.diagnostics,
            loadedVersion,
        };
    }, [catalog, adapters, loaded, loadedVersion]);
}
