// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { portalHomeTemplate } from './dashboardTemplates';
import { portalOrdersTemplate, portalInvoicesTemplate } from './listTemplates';
import { portalOrderPageTemplate } from './recordTemplates';
import { portalSupportTemplate } from './inboxTemplate';
import { portalProfileTemplate } from './profileTemplate';

export * from './dashboardTemplates';
export * from './listTemplates';
export * from './recordTemplates';
export * from './inboxTemplate';
export * from './profileTemplate';
export * from './formTemplates';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const customerPortalScreenTemplates = [portalHomeTemplate, portalOrdersTemplate, portalOrderPageTemplate, portalInvoicesTemplate, portalSupportTemplate, portalProfileTemplate];

export { customerPortalDialogs as customerPortalDialogTemplates } from './formTemplates';
