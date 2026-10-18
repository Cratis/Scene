// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { bookingsCalendarTemplate } from './calendarTemplate';
import { bookingsListTemplate, resourcesListTemplate } from './listTemplates';
import { bookingPageTemplate } from './recordTemplates';
import { newBookingWizardTemplate } from './wizardTemplate';

export * from './calendarTemplate';
export * from './listTemplates';
export * from './recordTemplates';
export * from './wizardTemplate';
export * from './formTemplates';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const bookingsScreenTemplates = [bookingsCalendarTemplate, bookingsListTemplate, bookingPageTemplate, resourcesListTemplate, newBookingWizardTemplate];

export { bookingsDialogs as bookingsDialogTemplates } from './formTemplates';
