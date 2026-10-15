// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationSourcesKind } from './NavigationSourcesKind';

/**
 * Where a region's items come from, as the region tag in design mode shows it.
 */
export interface NavigationSources {
    /** How the effective items relate to the application's. */
    kind: NavigationSourcesKind;

    /** The compact tag text: `defined here`, `inherited`, `Application + Sales` or `Sales only`. */
    label: string;
}
