// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ToolbarEmphasis } from '../toolbar/ToolbarEmphasis';

/**
 * An application-level toolbar button a navigation region declares: it opens the task dialog of a state change slice
 * over the current page.
 */
export interface NavigationButton {
    /** The button identity, unique in its region at the level that owns it. */
    id: string;

    /** The text shown on the button. */
    title: string;

    /**
     * The qualified id of the state change slice the button opens, for example `sales.orders.PlaceOrder`; absent for a
     * button that has none yet.
     */
    slice?: string;

    /** How prominent the button is; `secondary` when absent. */
    emphasis?: ToolbarEmphasis;

    /** Qualified icon reference, when the button has one. */
    icon?: string;

    /** The policy the user must satisfy to see the button; the button is shown to everyone when absent. */
    authorize?: string;
}

export const NavigationButtonPropertyNames: (keyof NavigationButton)[] = ['id', 'title', 'slice', 'emphasis', 'icon', 'authorize'];
