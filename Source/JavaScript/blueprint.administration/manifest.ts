// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { administrationBlueprintName } from './packageName';
import { administrationScreenDefinitions } from './administrationScreenSet';
import { administrationDialogTemplates, administrationScreenTemplates } from './templates';

const description = 'Users, roles and permissions, settings and an audit log for an administrator: a user list and page, a roles list beside its permission matrix, a settings form and a read-only audit log.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const administrationBlueprintManifest: ScenePackage = {
    name: administrationBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: administrationScreenTemplates.map(template => template.name),
    dialogTemplates: administrationDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'Administration',
    description,
    module: '@cratis/scene.blueprint.administration',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [{ id: 'admin-default', title: 'Administration · Default', locale: 'en-GB', path: 'sampleData/admin-default.json' }],
    blueprint: {
        domain: 'administration',
        description,
        thumbnail: 'thumbnails/administration.svg',
        screenSet: administrationScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'admin-default',
    },
};
