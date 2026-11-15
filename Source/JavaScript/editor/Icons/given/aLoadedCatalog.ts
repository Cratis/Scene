// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconPickerCatalog } from '@cratis/components/IconPicker';
import { EffectiveIconCatalog } from '@cratis/scene.engine';
import { effectiveIconCatalogOf } from '../effectiveIconCatalogOf';
import { toIconPickerCatalog } from '../toIconPickerCatalog';
import { anIconLibrary } from './anIconLibrary';

export interface LoadedCatalog {
    effective: EffectiveIconCatalog;
    offered: IconPickerCatalog;
}

// An effective catalog over `Acme.Icons` (home, trash) with everything loaded, as the picker sees it.
export async function aLoadedCatalog(): Promise<LoadedCatalog> {
    const effective = effectiveIconCatalogOf(['Acme.Icons'], [anIconLibrary('Acme.Icons', ['home', 'trash'])]);
    const { entries } = await effective.search();
    await effective.load();
    return { effective, offered: toIconPickerCatalog(effective, entries) };
}
