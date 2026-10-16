// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { approvalsBlueprintName } from './packageName';
import { approvalsScreenDefinitions } from './approvalsScreenSet';
import { approvalsDialogTemplates, approvalsScreenTemplates } from './templates';

const description = 'Requests and approvals: an approver\'s inbox, my requests, a new-request wizard, request pages with their approval chain and the request types an organisation offers.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const approvalsBlueprintManifest: ScenePackage = {
    name: approvalsBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: approvalsScreenTemplates.map(template => template.name),
    dialogTemplates: approvalsDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'Approvals and Requests',
    description,
    module: '@cratis/scene.blueprint.approvals',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [
        { id: 'approvals-general', title: 'Approvals · General', locale: 'en-GB', path: 'sampleData/approvals-general.json' },
        { id: 'approvals-nordic', title: 'Approvals · Nordic', locale: 'nb-NO', path: 'sampleData/approvals-nordic.json' },
    ],
    blueprint: {
        domain: 'approvals',
        description,
        thumbnail: 'thumbnails/approvals.svg',
        screenSet: approvalsScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'approvals-general',
    },
};
