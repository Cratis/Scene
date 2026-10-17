// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { inventoryBlueprintName } from './packageName';
import { inventoryScreenDefinitions } from './inventoryScreenSet';
import { inventoryDialogTemplates, inventoryScreenTemplates } from './templates';

const description = 'Items, locations, movements and suppliers for a warehouse: a dashboard, item lists and cards, item pages, a location tree, stock adjustment and check in and out.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const inventoryBlueprintManifest: ScenePackage = {
    name: inventoryBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: inventoryScreenTemplates.map(template => template.name),
    dialogTemplates: inventoryDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'Inventory and Assets',
    description,
    module: '@cratis/scene.blueprint.inventory',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [{ id: 'inventory-warehouse', title: 'Inventory · Warehouse', locale: 'en-GB', path: 'sampleData/inventory-warehouse.json', description: 'Warehouse items, stock levels, locations and suppliers.', columns: ['Sku', 'Name', 'Category', 'Location', 'Quantity'], statusColumn: 'Status', statuses: { good: ['Active', 'In stock'], pending: ['Low stock', 'On hold'], bad: ['Out of stock'] } }],
    blueprint: {
        domain: 'inventory',
        description,
        thumbnail: 'thumbnails/inventory.svg',
        screenSet: inventoryScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'inventory-warehouse',
    },
};
