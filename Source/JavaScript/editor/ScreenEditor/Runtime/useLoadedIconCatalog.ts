// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useState } from 'react';
import type { EffectiveIconCatalog } from '@cratis/scene.engine';

// Reads the catalogs of an effective icon catalog and says how many times a read has finished.
//
// Scene's editing is synchronous, so it can only check an icon against a catalog that has already been read; until then it
// lets the edit through with a warning that the icon could not be verified. The editor puts the returned number among the
// dependencies of its editing context, so the context - and every inspection made with it - is rebuilt the moment the
// catalogs are in, and a stored icon that does not resolve is reported without anyone having to touch the screen again.
export function useLoadedIconCatalog(catalog: EffectiveIconCatalog): number {
    const [loaded, setLoaded] = useState<{ catalog: EffectiveIconCatalog; times: number }>({ catalog, times: 0 });

    useEffect(() => {
        let isCurrent = true;
        const finish = () => { if (isCurrent) setLoaded(previous => ({ catalog, times: previous.times + 1 })); };
        catalog.load().then(finish, finish);
        return () => { isCurrent = false; };
    }, [catalog]);

    return loaded.catalog === catalog ? loaded.times : 0;
}
