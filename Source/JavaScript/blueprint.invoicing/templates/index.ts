// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { invoicingOverviewTemplate } from './dashboardTemplates';
import { invoicesListTemplate, paymentsListTemplate } from './listTemplates';
import { invoicePageTemplate } from './recordTemplates';
import { invoicingDueDatesTemplate } from './calendarTemplate';

export * from './dashboardTemplates';
export * from './listTemplates';
export * from './recordTemplates';
export * from './calendarTemplate';
export * from './formTemplates';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const invoicingScreenTemplates = [invoicingOverviewTemplate, invoicesListTemplate, invoicePageTemplate, paymentsListTemplate, invoicingDueDatesTemplate];

export { invoicingDialogs as invoicingDialogTemplates } from './formTemplates';
