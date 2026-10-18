// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { catalogBlueprintName } from './packageName';
import { catalogScreenDefinitions } from './catalogScreenSet';
import { catalogDialogTemplates, catalogScreenTemplates } from './templates';

const description = 'Products and categories for a sales team: a catalog overview, a product list, a product page with its variants and price history, and the categories they sit in.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const catalogBlueprintManifest: ScenePackage = {
    name: catalogBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: catalogScreenTemplates.map(template => template.name),
    dialogTemplates: catalogDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'Catalog',
    description,
    module: '@cratis/scene.blueprint.catalog',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [{ id: 'catalog-en', title: 'Catalog · English', locale: 'en-GB', path: 'sampleData/catalog-en.json', description: 'English product catalog: twelve products in six categories, one product\'s variants and price history, stock health and recent changes.', columns: ['SKU', 'Product', 'Category', 'Price', 'In stock'], statusColumn: 'Status', statuses: { good: ['Active', 'Visible'], pending: ['Draft', 'Low stock'], bad: ['Discontinued'] } }],
    blueprint: {
        domain: 'catalog',
        description,
        thumbnail: 'thumbnails/catalog.svg',
        screenSet: catalogScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'catalog-en',
    },
};
