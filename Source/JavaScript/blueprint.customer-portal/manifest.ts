// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { customerPortalBlueprintName } from './packageName';
import { customerPortalScreenDefinitions } from './customerPortalScreenSet';
import { customerPortalDialogTemplates, customerPortalScreenTemplates } from './templates';

const description = 'A self-service portal for customers: an account home, their orders and invoices, a support inbox and their own profile.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const customerPortalBlueprintManifest: ScenePackage = {
    name: customerPortalBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: customerPortalScreenTemplates.map(template => template.name),
    dialogTemplates: customerPortalDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'Customer portal',
    description,
    module: '@cratis/scene.blueprint.customer-portal',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [{ id: 'customer-portal-en', title: 'Customer portal · English', locale: 'en-GB', path: 'sampleData/customer-portal-en.json', description: 'English portal data for one customer: their orders and invoices, one order\'s lines and tracking, support conversations and the contact\'s profile.', columns: ['Order', 'Placed', 'Delivery', 'Items', 'Total'], statusColumn: 'Status', statuses: { good: ['Delivered', 'Shipped', 'Paid'], pending: ['In progress', 'Unpaid'], bad: ['Overdue', 'Cancelled'] } }],
    blueprint: {
        domain: 'customer-portal',
        description,
        thumbnail: 'thumbnails/customer-portal.svg',
        screenSet: customerPortalScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'customer-portal-en',
    },
};
