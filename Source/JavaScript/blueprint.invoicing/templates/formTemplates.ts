// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, TemplateScope } from '@cratis/scene.model';
import { quickCreateDialogTemplate } from '@cratis/scene.blueprint.default';
import { InvoicingQuery, fromQuery, localeOfData } from '../invoicingQueries';
import { closesDialog, component, invoicingMetadata, withBehaviors } from '../invoicingParts';

/**
 * One quick-create dialog: the foundation `QuickCreateDialog` - a short form opened from a page to make one record without leaving it - with the fields
 * that thing needs to get started.
 */
function quickCreateOf(name: string, title: string, sections: string, noun: string, submit: string): DialogTemplate {
    return {
        name,
        slots: quickCreateDialogTemplate.slots,
        content: {
            header: [component(`${name}-frame`, 'dialogFrame', { title, subtitle: 'Only what is needed to get started' })],
            body: [withBehaviors(component(`${name}-form`, 'formScreenBody', {
                mode: 'create', saveAndNew: false, strings: { formSave: submit }, sections: fromQuery(sections), errors: fromQuery(InvoicingQuery.FormErrors, '0'), ...localeOfData,
            }), closesDialog())],
            actions: [],
        },
        displayName: `Invoicing quick create ${noun}`,
        description: `A short form that creates one ${noun} without leaving the page.`,
        metadata: invoicingMetadata(name, 'Dialog', [TemplateScope.Slice]),
    };
}

/** The quick dialogs of the blueprint. */
export const invoicingDialogs: DialogTemplate[] = [
    quickCreateOf('InvoicingQuickCreateInvoice', 'New invoice', 'InvoiceQuickSections', 'invoice', 'Create'),
    quickCreateOf('InvoicingRecordPayment', 'Record a payment', 'InvoicingRecordPaymentSections', 'payment', 'Record payment'),
];
