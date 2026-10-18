// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { catalogOverviewTemplate } from './dashboardTemplates';
import { productsListTemplate, categoriesListTemplate } from './listTemplates';
import { productPageTemplate } from './recordTemplates';

export * from './dashboardTemplates';
export * from './listTemplates';
export * from './recordTemplates';
export * from './formTemplates';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const catalogScreenTemplates = [catalogOverviewTemplate, productsListTemplate, productPageTemplate, categoriesListTemplate];

export { catalogDialogs as catalogDialogTemplates } from './formTemplates';
