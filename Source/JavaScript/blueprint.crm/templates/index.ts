// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { crmDashboardTemplate } from './dashboardTemplate';
import { crmFormTemplates } from './formTemplates';
import { crmActivityListTemplate, crmCompanyListTemplate, crmContactListTemplate, crmDealListTemplate, crmDealPipelineTemplate, crmLeadListTemplate } from './listTemplates';
import { crmCompanyPageTemplate, crmContactPageTemplate, crmDealPageTemplate } from './recordTemplates';

export * from './dashboardTemplate';
export * from './listTemplates';
export * from './recordTemplates';
export * from './formTemplates';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const crmScreenTemplates = [
    crmDashboardTemplate,
    crmLeadListTemplate, crmContactListTemplate, crmCompanyListTemplate, crmDealPipelineTemplate, crmDealListTemplate, crmActivityListTemplate,
    crmContactPageTemplate, crmCompanyPageTemplate, crmDealPageTemplate,
    ...crmFormTemplates,
];

export { crmQuickCreateDialogs as crmDialogTemplates } from './formTemplates';
