// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { supportDashboardTemplate } from './dashboardTemplate';
import { ticketCreateFormTemplate, ticketPortalFormTemplate } from './formTemplates';
import { knowledgeBaseTemplate } from './knowledgeBaseTemplate';
import { customerListTemplate, myTicketsTemplate, ticketBoardTemplate, ticketQueueTemplate } from './listTemplates';
import { ticketPageTemplate } from './recordTemplates';

export * from './dashboardTemplate';
export * from './listTemplates';
export * from './recordTemplates';
export * from './formTemplates';
export * from './knowledgeBaseTemplate';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const ticketingScreenTemplates = [
    supportDashboardTemplate,
    ticketQueueTemplate, ticketBoardTemplate, ticketPageTemplate, ticketCreateFormTemplate, ticketPortalFormTemplate,
    myTicketsTemplate, customerListTemplate, knowledgeBaseTemplate,
];

export { ticketingDialogTemplates } from './formTemplates';
