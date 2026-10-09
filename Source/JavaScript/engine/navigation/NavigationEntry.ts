// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationReference } from '@cratis/scene.model';

/**
 * One place in the model a user can navigate from - a navigation item, toolbar action or link - reduced to
 * its stable identity and destination.
 */
export interface NavigationEntry {
    /** Stable identity used to point at the entry in diagnostics. */
    id?: string;

    /** Where the entry takes the user. */
    destination: DestinationReference;
}
