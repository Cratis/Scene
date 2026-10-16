// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { wizardScreenTemplate } from '@cratis/scene.blueprint.default';
import { ApprovalsQuery, fromQuery, localeOfData } from '../approvalsQueries';
import { approvalsMetadata, component } from '../approvalsParts';

/**
 * The new-request wizard (the foundation `WizardScreen`): **request type**, **details**, **attachments**, then **review and submit**. The type chooses what the
 * details ask for; an invalid step blocks Next and says why; the step the person has reached and the steps they have done survive a refresh, and a refresh can
 * never land past a step that was not done. Save draft keeps the request as a draft in My requests. The step's content is the slot named by its id.
 */
export const newRequestWizardTemplate: ScreenTemplate = {
    name: 'NewRequestWizard',
    fitsSlot: 'content',
    slots: wizardScreenTemplate.slots,
    arrangement: wizardScreenTemplate.arrangement,
    content: {
        header: [component('request-wizard-header', 'pageHeader', { title: 'New request', subtitle: 'Four short steps' })],
        progress: [component('request-wizard-progress', 'wizardProgress', { steps: fromQuery(ApprovalsQuery.WizardSteps), urlKey: 'step' }, {
            type: [component('request-wizard-type', 'formScreenBody', { mode: 'create', sections: fromQuery(ApprovalsQuery.TypeSections), errors: fromQuery(ApprovalsQuery.FormErrors, '0'), ...localeOfData })],
            details: [component('request-wizard-details', 'formScreenBody', { mode: 'create', sections: fromQuery(ApprovalsQuery.DetailSections), errors: fromQuery(ApprovalsQuery.FormErrors, '0'), ...localeOfData })],
            attachments: [component('request-wizard-attachments', 'fileUploader', { accept: '.pdf, .png, .jpg, .docx, .xlsx', maxSizeMb: 10, multiple: true, actionPermission: 'enabled' })],
            review: [component('request-wizard-review', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(ApprovalsQuery.ReviewSections), values: fromQuery(ApprovalsQuery.ReviewValues, '0'), ...localeOfData })],
        })],
        step: [],
        actions: [],
    },
    displayName: 'New request',
    description: 'Request type, details, attachments, then review and submit; the step survives a refresh and a draft can be saved.',
    metadata: approvalsMetadata('NewRequestWizard', 'Wizard', [TemplateScope.Feature, TemplateScope.Subfeature]),
};
