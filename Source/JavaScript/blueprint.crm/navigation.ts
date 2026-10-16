// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import { crmScreenDefinitions } from './crmScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const crmModule = 'crm';

/**
 * The application structure the screen set implies: one module, `crm`, a feature for each screen and the sub-features beneath it (`crm.leads.new` is the
 * `new` feature of `leads`). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const crmStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: crmModule, name: 'CRM', features: [], slices: [] };
    for (const screen of crmScreenDefinitions) {
        let parent = root;
        for (const id of screen.name.split('.').slice(1)) {
            let node = parent.features.find(candidate => candidate.id === id);
            if (!node) {
                node = { id, name: screen.title, features: [], slices: [] };
                parent.features.push(node);
            }
            parent = node;
        }
    }

    return { modules: [{ id: root.id, name: root.name, features: root.features }] } as unknown as ApplicationStructure;
})();

/**
 * The navigation of the application the blueprint is: the topbar names the module, and the module's sidebar - which overrides the application's - lists
 * the six places a sales team goes. Dashboard, Leads, Contacts, Companies, Deals (with its pipeline and its list beneath it) and Activities.
 */
export const crmNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'CRM' },
        regions: [{ region: NavigationRegionKind.Topbar, items: [{ id: 'crm', title: 'CRM', target: { module: crmModule } }] }],
    },
    modules: [{
        module: crmModule,
        regions: [{
            region: NavigationRegionKind.Sidebar,
            mode: NavigationRegionMode.Override,
            items: [
                { id: 'dashboard', title: 'Dashboard', target: { module: crmModule, feature: 'dashboard' } },
                { id: 'leads', title: 'Leads', target: { module: crmModule, feature: 'leads' } },
                { id: 'contacts', title: 'Contacts', target: { module: crmModule, feature: 'contacts' } },
                { id: 'companies', title: 'Companies', target: { module: crmModule, feature: 'companies' } },
                {
                    id: 'deals', title: 'Deals', target: { module: crmModule, feature: 'deals' }, children: [
                        { id: 'pipeline', title: 'Pipeline', target: { module: crmModule, feature: 'deals' } },
                        { id: 'deal-list', title: 'List', target: { module: crmModule, feature: 'deals.list' } },
                    ],
                },
                { id: 'activities', title: 'Activities', target: { module: crmModule, feature: 'activities' } },
            ],
        }],
    }],
};
