// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ToolbarEmphasis } from './ToolbarEmphasis';

/**
 * A toolbar button that invokes a state change slice. It is a `core:toolbarItem` with `kind: Action`, a `slice`
 * and an `emphasis`.
 */
export interface ToolbarButton {
    /** The button identity. */
    id: string;

    /** The text shown on the button. */
    title: string;

    /**
     * The qualified id of the state change slice the button invokes, for example `sales.orders.PlaceOrder`; absent
     * for a button that has none yet.
     */
    slice?: string;

    /** How prominent the button is; `secondary` when absent. */
    emphasis?: ToolbarEmphasis;

    /** Qualified icon reference, when the button has one. */
    icon?: string;

    /**
     * The command a hand-authored button names instead of a slice. It is turned into the slice that accepts the command
     * when exactly one does.
     */
    target?: string;
}

export const ToolbarButtonPropertyNames: (keyof ToolbarButton)[] = ['id', 'title', 'slice', 'emphasis', 'icon', 'target'];
