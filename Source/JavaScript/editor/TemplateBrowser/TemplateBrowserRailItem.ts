// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { BlueprintUpdate } from '../BlueprintGallery/BlueprintUpdate';
import type { TemplateBrowserRailKind } from './TemplateBrowserRailKind';

/** One row of the browser's left rail. */
export interface TemplateBrowserRailItem {
    /** The identity of the row: `all`, `own` or `blueprint:<package>`. */
    id: string;

    /** What the row selects. */
    kind: TemplateBrowserRailKind;

    /** The text of the row. */
    label: string;

    /** How many templates the row would list with the filter and target as they are. */
    count: number;

    /** For a blueprint, whether it is in the application's UI profile. A blueprint that is not is listed under "Needs a blueprint" and can be added. */
    installed: boolean;

    /** For a blueprint, the version on offer. */
    version?: string;

    /** For a blueprint, a sentence about it. */
    description?: string;

    /** For a blueprint, the thumbnail's path inside its package. */
    thumbnail?: string;

    /** For a blueprint, the update the application's pinned references to it are waiting for. */
    update?: BlueprintUpdate;
}

/** The identity of the rail row that selects every template. */
export const allTemplatesRailId = 'all';

/** The identity of the rail row that selects the application's own templates. */
export const ownTemplatesRailId = 'own';

/** The identity of the rail row of a blueprint. */
export const blueprintRailId = (blueprint: string): string => `blueprint:${blueprint}`;
