// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { formScreenTemplate, quickCreateDialogTemplate } from '@cratis/scene.blueprint.default';
import { ApprovalsQuery, fromQuery, localeOfData } from '../approvalsQueries';
import { approvalsMetadata, closesDialog, component, withBehaviors } from '../approvalsParts';

/** The request type editor: what a type asks for, how many steps approve it and who decides each. For administrators. */
export const requestTypeEditFormTemplate: ScreenTemplate = {
    name: 'RequestTypeEditForm',
    fitsSlot: 'content',
    slots: formScreenTemplate.slots,
    arrangement: formScreenTemplate.arrangement,
    content: {
        header: [component('request-type-header', 'pageHeader', { title: 'Edit request type', subtitle: 'What it asks for and who approves it' })],
        body: [component('request-type-body', 'formScreenBody', { mode: 'edit', sections: fromQuery(ApprovalsQuery.TypeEditorSections), errors: fromQuery(ApprovalsQuery.FormErrors, '0'), ...localeOfData })],
        actions: [],
    },
    displayName: 'Edit request type',
    description: 'A form that edits a request type: its name, what it asks for and its approval steps.',
    metadata: approvalsMetadata('RequestTypeEditForm', 'Form', [TemplateScope.Feature, TemplateScope.Subfeature]),
};

/**
 * The decision dialog (the foundation confirm dialog with a comment field): says which decision is being made - approve, reject or request changes -
 * and asks for a comment that the requester will see. The commit verb is the decision's.
 */
export const decisionDialogTemplate: DialogTemplate = {
    name: 'DecisionDialog',
    slots: quickCreateDialogTemplate.slots,
    content: {
        header: [component('decision-frame', 'dialogFrame', { title: 'Your decision', subtitle: 'Say why - the requester will see it' })],
        body: [withBehaviors(component('decision-form', 'formScreenBody', {
            mode: 'create', saveAndNew: false, strings: { formSave: 'Decide' }, sections: fromQuery(ApprovalsQuery.DecisionSections), errors: fromQuery(ApprovalsQuery.FormErrors, '0'), ...localeOfData,
        }), closesDialog())],
        actions: [],
    },
    displayName: 'Decision',
    description: 'A confirmation with a decision (approve, reject or request changes) and a comment for the requester.',
    metadata: approvalsMetadata('DecisionDialog', 'Dialog', [TemplateScope.Slice]),
};

/** A short form that adds a request type to the list without leaving it. */
export const requestTypeQuickCreateDialogTemplate: DialogTemplate = {
    name: 'RequestTypeQuickCreate',
    slots: quickCreateDialogTemplate.slots,
    content: {
        header: [component('request-type-frame', 'dialogFrame', { title: 'New request type', subtitle: 'Only what is needed to get started' })],
        body: [withBehaviors(component('request-type-quick', 'formScreenBody', {
            mode: 'create', saveAndNew: false, strings: { formSave: 'Create' }, sections: fromQuery(ApprovalsQuery.TypeEditorSections), errors: fromQuery(ApprovalsQuery.FormErrors, '0'), ...localeOfData,
        }), closesDialog())],
        actions: [],
    },
    displayName: 'New request type',
    description: 'A short form that adds a request type without leaving the page.',
    metadata: approvalsMetadata('RequestTypeQuickCreate', 'Dialog', [TemplateScope.Slice]),
};

/** The dialogs of the approvals application. */
export const approvalsDialogTemplates: DialogTemplate[] = [decisionDialogTemplate, requestTypeQuickCreateDialogTemplate];
