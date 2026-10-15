// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { boardScreenTemplate } from './boardScreenTemplate';
import { dashboardScreenTemplate } from './dashboardScreenTemplate';
import { formScreenTemplate } from './formScreenTemplate';
import { listScreenTemplate } from './listScreenTemplate';
import { masterDetailScreenTemplate } from './masterDetailScreenTemplate';
import { recordPageTemplate } from './recordPageTemplate';
import { wizardScreenTemplate } from './wizardScreenTemplate';
import { workspaceScreenTemplate } from './workspaceScreenTemplate';

export * from './templateParts';
export * from './boardScreenTemplate';
export * from './dashboardScreenTemplate';
export * from './formScreenTemplate';
export * from './listScreenTemplate';
export * from './masterDetailScreenTemplate';
export * from './recordPageTemplate';
export * from './wizardScreenTemplate';
export * from './workspaceScreenTemplate';

/** The foundation screen templates, in the order the manifest lists them. The workspace comes first: it is the container the master/detail nests in. */
export const foundationScreenTemplates = [
    workspaceScreenTemplate, dashboardScreenTemplate, listScreenTemplate, boardScreenTemplate, masterDetailScreenTemplate, recordPageTemplate, formScreenTemplate, wizardScreenTemplate,
];
