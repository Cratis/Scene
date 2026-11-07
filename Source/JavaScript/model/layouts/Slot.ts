// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Arrangement } from './Arrangement';
import { SlotRole } from './SlotRole';

/**
 * A named region of a {@link Layout} or screen template that content is placed in, positioned by its
 * {@link Arrangement}. A layout is not uniformly one arrangement mode — `flow` for most slots and
 * `freeform` for one is a valid combination.
 *
 * A slot is either filled by composition (a screen or a nested template fills it) or, when `routed`, replaced by
 * whatever screen navigation places there. A routed slot is a destination: a destination names it by `name`.
 */
export interface Slot {
    /** Stable slot name, used by screens that fill it and by destinations that navigate into it. */
    name: string;

    /** How the slot's filled content is positioned. */
    arrangement?: Arrangement;

    /** Optional description for designers. */
    description?: string;

    /**
     * What kind of region the slot is. Absent derives it: a `primary` slot is a `page`, any other slot a `pane`. Use
     * `resolveSlotRole` rather than reading this directly.
     */
    role?: SlotRole;

    /** Whether navigation replaces the slot's content, making it a destination. */
    routed?: boolean;

    /**
     * The route parameters the routed slot is addressed by - Screenplay's `routed by <param>`. Only meaningful on a
     * `routed` slot.
     */
    routedBy?: string[];

    /** Whether this is the slot every screen's content is placed in when nothing names another. At most one per owner. */
    primary?: boolean;

    /** Whether the slot may stay empty; an optional slot with no content takes no space. */
    optional?: boolean;

    /**
     * The semantic template types (`TemplateMetadata.type`) a screen must have to be placed in this slot, such as
     * `Detail` or `Form`. Absent accepts any screen. A destination that places a screen of another type here is
     * diagnosed as an incompatible slot rather than rendered somewhere it was not designed for.
     */
    accepts?: string[];
}

export const SlotPropertyNames: (keyof Slot)[] = ['name', 'arrangement', 'description', 'role', 'routed', 'routedBy', 'primary', 'optional', 'accepts'];
