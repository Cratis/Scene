// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { projectTrackerBlueprintName } from './packageName';
import { projectTrackerScreenDefinitions } from './projectTrackerScreenSet';
import { projectTrackerDialogTemplates, projectTrackerScreenTemplates } from './templates';

const description = 'Projects, tasks and a board for a team: projects as cards with progress, a project page with its tasks and members, a task board, a personal task list grouped by due date and a task side sheet.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const projectTrackerBlueprintManifest: ScenePackage = {
    name: projectTrackerBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: projectTrackerScreenTemplates.map(template => template.name),
    dialogTemplates: projectTrackerDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'Project and Task Tracker',
    description,
    module: '@cratis/scene.blueprint.project-tracker',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [{ id: 'project-tracker-en', title: 'Projects · English', locale: 'en-GB', path: 'sampleData/project-tracker-en.json', description: 'Projects, tasks and their progress, in English.', columns: ['Name', 'Owner', 'Progress', 'Due', 'Status'], statusColumn: 'Status', statuses: { good: ['Done', 'On track'], pending: ['At risk', 'In progress', 'Review', 'To do'], bad: ['Late'] } }],
    blueprint: {
        domain: 'project-tracker',
        description,
        thumbnail: 'thumbnails/project-tracker.svg',
        screenSet: projectTrackerScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'project-tracker-en',
    },
};
