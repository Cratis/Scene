// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { requestTypeEditFormTemplate } from './formTemplates';
import { allRequestsTemplate, approvalInboxTemplate, myRequestsTemplate, requestTypesTemplate } from './listTemplates';
import { requestPageTemplate } from './recordTemplates';
import { newRequestWizardTemplate } from './wizardTemplate';

export * from './listTemplates';
export * from './wizardTemplate';
export * from './recordTemplates';
export * from './formTemplates';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const approvalsScreenTemplates = [
    approvalInboxTemplate, myRequestsTemplate, newRequestWizardTemplate, requestPageTemplate, allRequestsTemplate, requestTypesTemplate, requestTypeEditFormTemplate,
];

export { approvalsDialogTemplates } from './formTemplates';
