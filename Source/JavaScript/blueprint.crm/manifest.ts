// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { crmBlueprintName } from './packageName';
import { crmScreenDefinitions } from './crmScreenSet';
import { crmDialogTemplates, crmScreenTemplates } from './templates';

const description = 'Leads, contacts, companies and deals for a sales team: a dashboard, lists, a pipeline board, record pages, forms and quick create.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const crmBlueprintManifest: ScenePackage = {
    name: crmBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: crmScreenTemplates.map(template => template.name),
    dialogTemplates: crmDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'CRM',
    description,
    module: '@cratis/scene.blueprint.crm',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [
        { id: 'crm-enterprise-en', title: 'CRM · Enterprise', locale: 'en-GB', path: 'sampleData/crm-enterprise-en.json' },
        { id: 'crm-nordic-smb', title: 'CRM · Nordic SMB', locale: 'nb-NO', path: 'sampleData/crm-nordic-smb.json' },
    ],
    blueprint: {
        domain: 'crm',
        description,
        thumbnail: 'thumbnails/crm.svg',
        screenSet: crmScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'crm-enterprise-en',
    },
};
