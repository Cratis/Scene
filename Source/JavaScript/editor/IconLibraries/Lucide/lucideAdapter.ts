// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconAdapter, IconGlyph } from '@cratis/scene.react';
import { dynamicIconImports } from 'lucide-react/dynamic';
import { lucideLibraryName } from './lucideManifest';

const importers = dynamicIconImports as Record<string, (() => Promise<{ default: IconGlyph }>) | undefined>;

// One icon module is loaded per glyph drawn, so a screen only pays for the icons it shows.
export const lucideAdapter: IconAdapter = {
    library: lucideLibraryName,
    loadGlyph: async ({ key }) => (await importers[key]?.())?.default,
};
