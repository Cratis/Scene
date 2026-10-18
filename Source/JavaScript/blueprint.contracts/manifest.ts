// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { contractsBlueprintName } from './packageName';
import { contractsScreenDefinitions } from './contractsScreenSet';
import { contractsDialogTemplates, contractsScreenTemplates } from './templates';

const description = 'Contracts for a legal or procurement team: a contract list, a contract page with its parties, obligations and amendments, a timeline of terms and an inbox for what needs review or signature.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const contractsBlueprintManifest: ScenePackage = {
    name: contractsBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: contractsScreenTemplates.map(template => template.name),
    dialogTemplates: contractsDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'Contracts',
    description,
    module: '@cratis/scene.blueprint.contracts',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [{ id: 'contracts-en', title: 'Contracts · English', locale: 'en-GB', path: 'sampleData/contracts-en.json', description: 'English contract data: twelve contracts from draft to expired, one contract\'s parties, obligations and amendments, the terms on a timeline and the review queue.', columns: ['Contract', 'Title', 'Counterparty', 'Ends', 'Value'], statusColumn: 'Status', statuses: { good: ['Active'], pending: ['Draft', 'In review', 'Expiring'], bad: ['Expired', 'Terminated'] } }],
    blueprint: {
        domain: 'contracts',
        description,
        thumbnail: 'thumbnails/contracts.svg',
        screenSet: contractsScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'contracts-en',
    },
};
