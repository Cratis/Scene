// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationRegionKind, OutletItemKind, OutletKind, OutletMode, SliceKind, type ApplicationStructure, type NavigationModel, type OutletNavigationItem } from '@cratis/scene.model';
import { applyNavigationEdits } from '@cratis/scene.engine';
import { defaultDesignModeStrings } from '../../DesignModeStrings';
import { createRegionItemSource, type RegionSourceInputs } from '../regionItemSource';
import type { DesignModePlan, DesignModeRejection } from '../../designModeTypes';

// The application of the spec's shell: Acme with Dashboard, Sales and Support.
export const structure: ApplicationStructure = {
    modules: [
        { id: 'dashboard', name: 'Dashboard', features: [{ id: 'overview', name: 'Overview', features: [], slices: [] }] },
        { id: 'sales', name: 'Sales', features: [
            { id: 'orders', name: 'Orders', features: [], slices: [{ id: 'PlaceOrder', name: 'PlaceOrder', kind: SliceKind.StateChange }] },
            { id: 'customers', name: 'Customers', features: [], slices: [] },
            { id: 'pipeline', name: 'Pipeline', features: [], slices: [] },
        ] },
        { id: 'support', name: 'Support', features: [
            { id: 'tickets', name: 'Tickets', features: [], slices: [] },
            { id: 'knowledge', name: 'Knowledge base', features: [], slices: [] },
        ] },
    ],
};

// Application items; Sales inherits the topbar and extends the sidebar; Support extends the topbar and overrides the sidebar (spec p11-1, p13-4).
const item = (id: string, title: string, module: string, feature?: string): OutletNavigationItem =>
    ({ kind: OutletItemKind.Navigation, id, title, target: { module, ...(feature ? { feature } : {}) } });

export const applicationNavigation = (): NavigationModel => ({
    application: {
        logo: { image: 'acme.svg', title: 'Acme' },
        outlets: [
            { name: NavigationRegionKind.Topbar, kind: OutletKind.Navigation, defaults: [
                item('dashboard', 'Dashboard', 'dashboard'),
                item('sales', 'Sales', 'sales'),
                item('support', 'Support', 'support'),
            ] },
            { name: NavigationRegionKind.Sidebar, kind: OutletKind.Navigation, defaults: [item('dash', 'Dashboard', 'dashboard')] },
        ],
    },
    modules: [
        { module: 'sales', refinements: [
            { outlet: NavigationRegionKind.Sidebar, mode: OutletMode.Extends, items: [
                item('orders', 'Orders', 'sales', 'orders'),
                item('customers', 'Customers', 'sales', 'customers'),
                item('pipeline', 'Pipeline', 'sales', 'pipeline'),
            ] },
        ] },
        { module: 'support', refinements: [
            { outlet: NavigationRegionKind.Topbar, mode: OutletMode.Extends, items: [item('help', 'Help center', 'support')] },
            { outlet: NavigationRegionKind.Sidebar, mode: OutletMode.Overrides, items: [
                item('tickets', 'Tickets', 'support', 'tickets'),
                item('knowledge', 'Knowledge base', 'support', 'knowledge'),
            ] },
        ] },
    ],
});

let counter = 0;
export const newItemId = () => `new-${++counter}`;

export const regionSource = (region: NavigationRegionKind, module: string | undefined, navigation = applicationNavigation(), rest: Partial<RegionSourceInputs> = {}) =>
    createRegionItemSource({
        region, module, navigation, structure, newId: newItemId, slots: ['content', 'aside'], startingLabel: 'New item',
        strings: {
            tagLong: defaultDesignModeStrings.navigation.tagLong, extendsNotice: defaultDesignModeStrings.navigation.extendsNotice, overrideHere: defaultDesignModeStrings.navigation.overrideHere,
            editAtApplication: defaultDesignModeStrings.navigation.editAtApplication, application: 'Application', mainArea: 'Main area',
        },
        ...rest,
    });

// Carries out what an action came to, the way the editor does: all-or-nothing on the navigation model.
export function carryOut(navigation: NavigationModel, outcome: DesignModePlan | DesignModeRejection) {
    if ('rejected' in outcome) throw new Error(`rejected: ${outcome.rejected}`);
    const applied = applyNavigationEdits(navigation, outcome.navigationEdits ?? []);
    if (!applied.applied) throw new Error(`not applied: ${applied.rejected}`);
    return { navigation: applied.model, plan: outcome };
}

export const titlesOf = (navigation: NavigationModel, region: NavigationRegionKind, module: string | undefined): string[] =>
    regionSource(region, module, navigation).items.map(item => item.parentId ? `  ${item.label}` : item.label);
