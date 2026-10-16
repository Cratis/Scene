// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { calendarScreenTemplate } from './calendarScreenTemplate';
import { importWizardTemplate } from './importWizardTemplate';
import { inboxScreenTemplate } from './inboxScreenTemplate';
import { profileScreenTemplate } from './profileScreenTemplate';
import { reportViewerTemplate } from './reportViewerTemplate';
import { settingsScreenTemplate } from './settingsScreenTemplate';
import { timelineScreenTemplate } from './timelineScreenTemplate';

export * from './calendarScreenTemplate';
export * from './timelineScreenTemplate';
export * from './inboxScreenTemplate';
export * from './settingsScreenTemplate';
export * from './profileScreenTemplate';
export * from './reportViewerTemplate';
export * from './importWizardTemplate';

/** The later additions of Part B 2.12, in the order they were added. They fit the application shell's `content` slot like the first eight foundation templates. */
export const laterScreenTemplates = [calendarScreenTemplate, timelineScreenTemplate, inboxScreenTemplate, settingsScreenTemplate, profileScreenTemplate, reportViewerTemplate, importWizardTemplate];
