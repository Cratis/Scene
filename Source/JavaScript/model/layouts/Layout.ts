// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Arrangement } from './Arrangement';
import { Slot } from './Slot';

/**
 * A named template of slots that a {@link Screen} fills with content. Mirrors Screenplay's `layout`
 * construct: a bare layout with plain slots is a special case of a layout whose slots all use the
 * default arrangement.
 */
export interface Layout {
    name: string;
    slots: Slot[];

    /**
     * How the layout's own `slots` position relative to each other - a {@link FlowArrangement} (leaves
     * are {@link FlowSlotLeaf}) or {@link FreeformSlotArrangement}, or `undefined` for the slots'
     * declaration order with no further positioning information. Distinct from each {@link Slot}'s own
     * `arrangement`, which positions that one slot's filled content instead of positioning the slots
     * themselves.
     */
    arrangement?: Arrangement;
}

export const LayoutPropertyNames: (keyof Layout)[] = ['name', 'slots', 'arrangement'];
