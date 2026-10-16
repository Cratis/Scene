// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { projectTaskBoardTemplate, projectTaskLanesTemplate } from './boardTemplate';
import { projectListTemplate, projectMyTasksTemplate } from './listTemplates';
import { projectPageTemplate } from './recordTemplates';
import { projectTimelineTemplate } from './timelineTemplate';

export * from './listTemplates';
export * from './recordTemplates';
export * from './boardTemplate';
export * from './timelineTemplate';
export * from './formTemplates';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const projectTrackerScreenTemplates = [projectListTemplate, projectPageTemplate, projectMyTasksTemplate, projectTaskBoardTemplate, projectTaskLanesTemplate, projectTimelineTemplate];

export { projectTrackerDialogs as projectTrackerDialogTemplates } from './formTemplates';
