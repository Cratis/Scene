// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import { collectIconUsages, type DescriptorCatalog, type IconUsage } from '@cratis/scene.engine';
import { parseStoredDocument } from '../Document/upgradeStoredDocument';

// The icons the stored screens use, with the screen each one is on, for the UI Profile's review of what a change to the
// icon libraries would leave unresolved. Scene finds the icons - the ones components carry, template instance overrides and
// the icon of each collection item such as a navigation item - and this only says whose screen they belong to. A screen whose
// document cannot be read is left out rather than failing the page, as it is for the other usages.
export function collectProfileIconUsages(
    screens: readonly { name: string; document: string | undefined }[],
    catalog: DescriptorCatalog,
): IconUsage[] {
    return screens.flatMap(screen => {
        if (!screen.document) return [];
        try {
            const document = parseStoredDocument<SceneDocument>(screen.document);
            return collectIconUsages(document, catalog).map(usage => ({ ...usage, location: usage.location ? `${screen.name} · ${usage.location}` : screen.name }));
        } catch {
            return [];
        }
    });
}
