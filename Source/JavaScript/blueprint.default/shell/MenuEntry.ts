// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** One authored entry in an overlay menu or breadcrumb trail. */
export interface MenuEntry {
    /** What to show for the entry. */
    label: string;

    /** The icon font class to draw before the label, or undefined for a label on its own. */
    icon?: string;

    /** Where activating the entry navigates, or undefined when the entry is the page already shown. */
    url?: string;
}
