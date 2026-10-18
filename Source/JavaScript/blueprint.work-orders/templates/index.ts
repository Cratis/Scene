// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { workOrdersListTemplate } from './listTemplates';
import { workOrderPageTemplate } from './recordTemplates';
import { workOrdersBoardTemplate } from './boardTemplate';
import { workOrdersScheduleTemplate } from './calendarTemplate';

export * from './listTemplates';
export * from './recordTemplates';
export * from './boardTemplate';
export * from './calendarTemplate';
export * from './formTemplates';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const workOrdersScreenTemplates = [workOrdersListTemplate, workOrderPageTemplate, workOrdersBoardTemplate, workOrdersScheduleTemplate];

export { workOrdersDialogs as workOrdersDialogTemplates } from './formTemplates';
