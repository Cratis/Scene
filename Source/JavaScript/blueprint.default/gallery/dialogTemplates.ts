// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate } from '@cratis/scene.model';
import { TemplateSlotName } from './TemplateSlotName';
import { button, card, externalComponent, panel, text } from './elements';
import { field } from './widgets';

/**
 * The three dialog shapes an application repeats: confirm something destructive, capture a short form, and
 * show a record without leaving the list behind it.
 *
 * A dialog template has no `fitsSlot`, and that absence is the whole distinction. A screen template is
 * *placed* - it fills a slot on whatever contains it, and the containment chain is what decides where it
 * appears. A dialog is *summoned*: it opens over the application from wherever the code that opened it
 * happens to be, so there is no parent slot for it to name.
 */

/** Confirm: one question, two answers, and enough context to answer it. */
export const confirmDialogTemplate: DialogTemplate = {
    name: 'ConfirmDialog',
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.Actions }],
    content: {
        [TemplateSlotName.Header]: [text('confirm-title', 'Archive this product?')],
        [TemplateSlotName.Body]: [
            text('confirm-message', 'Bamboo Watch will stop appearing in the catalog. Existing orders keep it.'),
            externalComponent('confirm-note', 'message', { severity: 'warn', text: 'This can be undone from the archive.' }),
        ],
        [TemplateSlotName.Actions]: [
            panel('confirm-actions', [button('confirm-yes', 'Archive', { severity: 'danger' }), button('confirm-no', 'Keep it', { severity: 'secondary' })]),
        ],
    },
    displayName: 'Confirmation dialog',
    description: 'One question with the consequence spelled out, and a way back.',
};

/** Form: a short capture that does not deserve a page of its own. */
export const formDialogTemplate: DialogTemplate = {
    name: 'FormDialog',
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.Actions }],
    content: {
        [TemplateSlotName.Header]: [text('form-dialog-title', 'Invite someone')],
        [TemplateSlotName.Body]: [
            field('form-dialog-email', 'Email', 'inputText', { placeholder: 'them@contoso.com' }),
            field('form-dialog-role', 'Role', 'dropdown', { options: ['Viewer', 'Editor', 'Administrator'] }),
            field('form-dialog-message', 'Message', 'inputTextarea', { rows: 3 }),
        ],
        [TemplateSlotName.Actions]: [
            panel('form-dialog-actions', [button('form-dialog-send', 'Send invitation', { severity: 'primary' }), button('form-dialog-cancel', 'Cancel', { severity: 'secondary' })]),
        ],
    },
    displayName: 'Form dialog',
    description: 'A handful of fields captured without leaving the page underneath.',
};

/** Detail: a record shown over the list it came from. */
export const detailDialogTemplate: DialogTemplate = {
    name: 'DetailDialog',
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.SidePanel }, { name: TemplateSlotName.Actions }],
    content: {
        [TemplateSlotName.Header]: [text('detail-dialog-title', 'ORD-4192')],
        [TemplateSlotName.Body]: [
            card('detail-dialog-summary', [
                text('detail-dialog-customer', 'Northwind Traders'),
                text('detail-dialog-total', '$1,240.00'),
                externalComponent('detail-dialog-status', 'tag', { value: 'Shipped', severity: 'success' }),
            ]),
        ],
        [TemplateSlotName.SidePanel]: [externalComponent('detail-dialog-timeline', 'timeline', { align: 'left' })],
        [TemplateSlotName.Actions]: [
            panel('detail-dialog-actions', [button('detail-dialog-open', 'Open full record', { severity: 'primary', targetScreen: 'DetailView' }), button('detail-dialog-close', 'Close', { severity: 'secondary' })]),
        ],
    },
    displayName: 'Detail dialog',
    description: 'A record over the list it came from, with a route to the full page.',
};

/** The dialog templates this blueprint provides. */
export const galleryDialogTemplates: DialogTemplate[] = [confirmDialogTemplate, formDialogTemplate, detailDialogTemplate];
