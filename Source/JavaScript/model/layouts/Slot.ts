// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Arrangement } from './Arrangement';

/**
 * A named placeholder within a {@link Layout}, filled with content by a screen and positioned by its
 * {@link Arrangement}. A layout is not uniformly one arrangement mode — `flow` for most slots and
 * `freeform` for one is a valid combination.
 */
export interface Slot {
    name: string;
    arrangement?: Arrangement;
}

export const SlotPropertyNames: (keyof Slot)[] = ['name', 'arrangement'];
