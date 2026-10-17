// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { hrBlueprintName } from './packageName';
import { hrScreenDefinitions } from './hrScreenSet';
import { hrDialogTemplates, hrScreenTemplates } from './templates';

const description = 'People, the org chart, time off and onboarding for an HR team: a directory of cards, employee pages, an org tree, time-off requests and balances, and onboarding checklists.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const hrBlueprintManifest: ScenePackage = {
    name: hrBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: hrScreenTemplates.map(template => template.name),
    dialogTemplates: hrDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'HR People and Time Off',
    description,
    module: '@cratis/scene.blueprint.hr',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [{ id: 'hr-nordic', title: 'HR · Nordic', locale: 'nb-NO', path: 'sampleData/hr-nordic.json', description: 'Norwegian employees, time off and onboarding.', columns: ['Name', 'Title', 'Department', 'Location', 'Email'], statusColumn: 'Status', statuses: { good: ['Aktiv', 'Fullført', 'Godkjent', 'Signert'], pending: ['Permisjon', 'Prøvetid', 'Pågår', 'Utløper snart', 'Venter'], bad: ['Avslått'] } }],
    blueprint: {
        domain: 'hr',
        description,
        thumbnail: 'thumbnails/hr.svg',
        screenSet: hrScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'hr-nordic',
    },
};
