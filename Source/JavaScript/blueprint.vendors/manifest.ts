// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { vendorsBlueprintName } from './packageName';
import { vendorsScreenDefinitions } from './vendorsScreenSet';
import { vendorsDialogTemplates, vendorsScreenTemplates } from './templates';

const description = 'Vendors for a purchasing team: a vendor list, a vendor page with its contacts, orders and certificates, an onboarding board and a performance dashboard.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const vendorsBlueprintManifest: ScenePackage = {
    name: vendorsBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: vendorsScreenTemplates.map(template => template.name),
    dialogTemplates: vendorsDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'Vendors',
    description,
    module: '@cratis/scene.blueprint.vendors',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [{ id: 'vendors-en', title: 'Vendors · English', locale: 'en-GB', path: 'sampleData/vendors-en.json', description: 'English vendor data: twelve vendors from prospect to active, one vendor\'s contacts, purchase orders and certificates, the onboarding steps and performance figures.', columns: ['Vendor', 'Category', 'Country', 'Spend', 'Rating'], statusColumn: 'Status', statuses: { good: ['Active', 'Approved'], pending: ['Prospect', 'In review'], bad: ['Suspended'] } }],
    blueprint: {
        domain: 'vendors',
        description,
        thumbnail: 'thumbnails/vendors.svg',
        screenSet: vendorsScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'vendors-en',
    },
};
