// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { OutletContribution, OutletNavigationItem } from '@cratis/scene.model';

/** A navigation item as the designer lists it: what it is called, where it leads, and the group it sits under. */
export interface NavigationItem {
    id: string;
    label: string;

    /** What the item leads to, as `Module.Feature`; empty when it leads nowhere yet. */
    target: string;

    /** The title of the item it sits under, when it is a sub-item. */
    group?: string;
    item: OutletNavigationItem;
}

/**
 * A {@link NavigationItem} paired with the {@link OutletContribution} it came from - part of StudioIssues#158. Since Scene 5 a screen contributes
 * navigation items to an outlet of navigation (its `outletContributions`); the designer also needs the source contribution back, to select or
 * highlight where a clicked item came from.
 */
export interface NavigationItemWithSource {
    item: NavigationItem;
    source: OutletContribution;
}
