// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconCatalogSource } from '@cratis/scene.engine';
import { IconEntry } from '@cratis/scene.model';
import { lucideLibraryName } from './lucideManifest';

// The catalog is a 340 KB JSON document, so it is its own chunk and is only read when something needs it.
export const lucideCatalog: IconCatalogSource = {
    library: lucideLibraryName,
    loadEntries: async () => (await import('./catalog.json')).default as IconEntry[],
};
