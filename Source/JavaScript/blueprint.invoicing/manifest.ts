// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { invoicingBlueprintName } from './packageName';
import { invoicingScreenDefinitions } from './invoicingScreenSet';
import { invoicingDialogTemplates, invoicingScreenTemplates } from './templates';

const description = 'Invoices for a finance team: a receivables overview, an invoice list, an invoice page with its lines and payments, the payments received and a due-date calendar.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const invoicingBlueprintManifest: ScenePackage = {
    name: invoicingBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: invoicingScreenTemplates.map(template => template.name),
    dialogTemplates: invoicingDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'Invoicing',
    description,
    module: '@cratis/scene.blueprint.invoicing',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [{ id: 'invoicing-en', title: 'Invoicing · English', locale: 'en-GB', path: 'sampleData/invoicing-en.json', description: 'English invoicing data: twelve invoices for six customers from draft to paid, one invoice\'s lines and payments, the payments received and the receivables figures.', columns: ['Invoice', 'Customer', 'Issued', 'Due', 'Amount'], statusColumn: 'Status', statuses: { good: ['Paid'], pending: ['Draft', 'Sent'], bad: ['Overdue', 'Void'] } }],
    blueprint: {
        domain: 'invoicing',
        description,
        thumbnail: 'thumbnails/invoicing.svg',
        screenSet: invoicingScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'invoicing-en',
    },
};
