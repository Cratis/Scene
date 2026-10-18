// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`vendors.list.record` would be the `record` feature of `list`). */
export interface VendorsScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const vendorsScreenDefinitions: VendorsScreenDefinition[] = [
    { name: 'vendors.list', title: 'Vendors', template: 'VendorsList', order: 0, description: 'Every vendor with what you spend with them and how they perform.' },
    { name: 'vendors.record', title: 'Vendor', template: 'VendorPage', parent: 'vendors.list', description: 'One vendor: key facts, contacts, purchase orders, certificates and activity.' },
    { name: 'vendors.onboarding', title: 'Onboarding', template: 'VendorsOnboardingBoard', order: 1, description: 'Vendors in a column for each onboarding step: prospect, in review, approved and active.' },
    { name: 'vendors.performance', title: 'Performance', template: 'VendorsPerformance', order: 2, description: 'How vendors perform: spend, on-time delivery and the vendors to watch.' },
];
