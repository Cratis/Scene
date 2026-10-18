// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`catalog.list.record` would be the `record` feature of `list`). */
export interface CatalogScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const catalogScreenDefinitions: CatalogScreenDefinition[] = [
    { name: 'catalog.overview', title: 'Overview', template: 'CatalogOverview', order: 0, description: 'How the catalog is doing: what is live, what is out of stock and what changed lately.' },
    { name: 'catalog.products', title: 'Products', template: 'ProductsList', order: 1, description: 'Every product with its price, stock and status.' },
    { name: 'catalog.record', title: 'Product', template: 'ProductPage', parent: 'catalog.products', description: 'One product: key facts, its variants, its price history and its activity.' },
    { name: 'catalog.categories', title: 'Categories', template: 'CategoriesList', order: 2, description: 'The categories products sit in and who owns them.' },
];
