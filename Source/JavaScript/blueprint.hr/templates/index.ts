// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { hrEmployeeDirectoryTemplate, hrOnboardingListTemplate, hrTimeOffBalanceListTemplate, hrTimeOffListTemplate } from './listTemplates';
import { hrOrgChartTemplate } from './orgChartTemplate';
import { hrTeamCalendarTemplate } from './teamCalendarTemplate';
import { hrEmployeePageTemplate, hrOnboardingChecklistTemplate } from './recordTemplates';

export * from './listTemplates';
export * from './recordTemplates';
export * from './orgChartTemplate';
export * from './teamCalendarTemplate';
export * from './formTemplates';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const hrScreenTemplates = [
    hrEmployeeDirectoryTemplate, hrEmployeePageTemplate,
    hrOrgChartTemplate,
    hrTimeOffListTemplate, hrTimeOffBalanceListTemplate, hrTeamCalendarTemplate,
    hrOnboardingListTemplate, hrOnboardingChecklistTemplate,
];

export { hrQuickCreateDialogs as hrDialogTemplates } from './formTemplates';
