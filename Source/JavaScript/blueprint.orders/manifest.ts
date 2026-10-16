// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { ordersBlueprintName } from './packageName';
import { ordersScreenDefinitions } from './ordersScreenSet';
import { ordersDialogTemplates, ordersScreenTemplates } from './templates';

const description = 'Sales orders from placing to delivery: every order with its status, an order page with its lines and shipments, a fulfilment board and a delivery calendar.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const ordersBlueprintManifest: ScenePackage = {
    name: ordersBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: ordersScreenTemplates.map(template => template.name),
    dialogTemplates: ordersDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'Orders',
    description,
    module: '@cratis/scene.blueprint.orders',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [{ id: 'orders-en', title: 'Orders · English', locale: 'en-GB', path: 'sampleData/orders-en.json' }],
    blueprint: {
        domain: 'orders',
        description,
        thumbnail: 'thumbnails/orders.svg',
        screenSet: ordersScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'orders-en',
    },
};
