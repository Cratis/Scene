// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EffectiveOutlet } from '@cratis/scene.engine';
import { OutletKind } from '@cratis/scene.model';
import { OutletActionsView } from './OutletActionsView';
import { OutletFiltersView } from './OutletFiltersView';
import { OutletNavigationView } from './OutletNavigationView';
import { OutletStatsView } from './OutletStatsView';
import { OutletTabsView } from './OutletTabsView';

export interface OutletViewProps {
    /** The resolved outlet (`effectiveOutlet`). */
    outlet: EffectiveOutlet;

    /** The item an outlet of actions acts on - the selected row - when there is one. */
    item?: unknown;

    /** The id of the element that draws the outlet. */
    elementId?: string;
}

/**
 * Draws a resolved outlet by its kind: actions as a toolbar, filters as controls that write query parameters, tabs with
 * the slot they own, stats from query fields, and navigation as a list of targets. A host that resolves outlets itself
 * renders them with this; a document places them with the `core:outletItems` component.
 */
export function OutletView({ outlet, item, elementId }: OutletViewProps) {
    switch (outlet.kind) {
        case OutletKind.Actions: return <OutletActionsView outlet={outlet} item={item} elementId={elementId} />;
        case OutletKind.Filters: return <OutletFiltersView outlet={outlet} elementId={elementId} />;
        case OutletKind.Tabs: return <OutletTabsView outlet={outlet} elementId={elementId} />;
        case OutletKind.Stats: return <OutletStatsView outlet={outlet} elementId={elementId} />;
        case OutletKind.Navigation: return <OutletNavigationView outlet={outlet} elementId={elementId} />;
        default: return null;
    }
}
