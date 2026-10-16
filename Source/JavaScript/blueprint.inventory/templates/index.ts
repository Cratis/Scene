// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { inventoryDashboardTemplate } from './dashboardTemplate';
import { inventoryFormTemplates } from './formTemplates';
import { inventoryItemGalleryTemplate, inventoryItemListTemplate, inventoryMovementListTemplate, inventorySupplierListTemplate } from './listTemplates';
import { inventoryLocationsTemplate } from './locationsTemplate';
import { inventoryItemPageTemplate } from './recordTemplates';

export * from './dashboardTemplate';
export * from './listTemplates';
export * from './recordTemplates';
export * from './locationsTemplate';
export * from './formTemplates';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const inventoryScreenTemplates = [
    inventoryDashboardTemplate,
    inventoryItemListTemplate, inventoryItemGalleryTemplate, inventoryItemPageTemplate,
    inventoryLocationsTemplate,
    inventoryMovementListTemplate, ...inventoryFormTemplates,
    inventorySupplierListTemplate,
];

export { inventoryQuickCreateDialogs as inventoryDialogTemplates } from './formTemplates';
