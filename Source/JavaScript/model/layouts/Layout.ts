// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Slot } from './Slot';

/**
 * A named template of slots that a {@link Screen} fills with content. Mirrors Screenplay's `layout`
 * construct: a bare layout with plain slots is a special case of a layout whose slots all use the
 * default arrangement.
 */
export interface Layout {
    name: string;
    slots: Slot[];
}

export const LayoutPropertyNames: (keyof Layout)[] = ['name', 'slots'];
