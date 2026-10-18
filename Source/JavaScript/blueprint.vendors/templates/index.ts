// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { vendorsListTemplate } from './listTemplates';
import { vendorPageTemplate } from './recordTemplates';
import { vendorsOnboardingTemplate } from './boardTemplate';
import { vendorsPerformanceTemplate } from './dashboardTemplates';

export * from './listTemplates';
export * from './recordTemplates';
export * from './boardTemplate';
export * from './dashboardTemplates';
export * from './formTemplates';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const vendorsScreenTemplates = [vendorsListTemplate, vendorPageTemplate, vendorsOnboardingTemplate, vendorsPerformanceTemplate];

export { vendorsDialogs as vendorsDialogTemplates } from './formTemplates';
