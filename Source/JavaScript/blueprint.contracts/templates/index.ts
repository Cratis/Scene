// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { contractsListTemplate } from './listTemplates';
import { contractPageTemplate } from './recordTemplates';
import { contractsTimelineTemplate } from './timelineTemplate';
import { contractsReviewTemplate } from './inboxTemplate';

export * from './listTemplates';
export * from './recordTemplates';
export * from './timelineTemplate';
export * from './inboxTemplate';
export * from './formTemplates';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const contractsScreenTemplates = [contractsListTemplate, contractPageTemplate, contractsTimelineTemplate, contractsReviewTemplate];

export { contractsDialogs as contractsDialogTemplates } from './formTemplates';
