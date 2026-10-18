// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { workOrdersBlueprintName } from './packageName';
import { workOrdersScreenDefinitions } from './workOrdersScreenSet';
import { workOrdersDialogTemplates, workOrdersScreenTemplates } from './templates';

const description = 'Work orders for a maintenance or field-service team: a work order list, a work order page with its tasks, parts and time, a board by step and a schedule of visits.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const workOrdersBlueprintManifest: ScenePackage = {
    name: workOrdersBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: workOrdersScreenTemplates.map(template => template.name),
    dialogTemplates: workOrdersDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'Work orders',
    description,
    module: '@cratis/scene.blueprint.work-orders',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [{ id: 'work-orders-en', title: 'Work orders · English', locale: 'en-GB', path: 'sampleData/work-orders-en.json', description: 'English work order data: twelve work orders across four sites from new to done, one work order\'s tasks, parts and time, the board columns and the scheduled visits.', columns: ['Work order', 'Title', 'Site', 'Assignee', 'Due'], statusColumn: 'Status', statuses: { good: ['Done'], pending: ['New', 'Scheduled', 'In progress'], bad: ['On hold'] } }],
    blueprint: {
        domain: 'work-orders',
        description,
        thumbnail: 'thumbnails/work-orders.svg',
        screenSet: workOrdersScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'work-orders-en',
    },
};
