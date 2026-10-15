// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate } from '@cratis/scene.model';
import { actionButton, closingDialog, dialogMetadata, foundationDialogTemplates } from '../foundation/templates/dialogTemplates';
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

/**
 * Confirm: one question, two answers, and enough context to answer it - the consequences listed, and the confirming button naming what it does
 * (`Archive product`, never `OK`). A destructive confirmation takes the danger tone: the heading and border are drawn in the danger colors and the
 * confirming button is the danger button. The components blueprint has a `ConfirmDialog` of its own for a command; a reference names the blueprint
 * (`resolveTemplateReference`), so the two never collide.
 */
export const confirmDialogTemplate: DialogTemplate = {
    name: 'ConfirmDialog',
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.Actions }],
    content: {
        [TemplateSlotName.Header]: [externalComponent('confirm-frame', 'dialogFrame', {
            title: 'Archive this product?', message: 'Bamboo Watch will stop appearing in the catalog.', tone: 'danger',
            consequences: ['Existing orders keep it', 'It can be restored from the archive'],
        })],
        [TemplateSlotName.Body]: [],
        [TemplateSlotName.Actions]: [
            panel('confirm-actions', [closingDialog(actionButton('confirm-no', { label: 'Keep it', emphasis: 'secondary' })), actionButton('confirm-yes', { label: 'Archive product', emphasis: 'danger' })]),
        ],
    },
    displayName: 'Confirmation dialog',
    description: 'One question with the consequence spelled out, and a way back.',
    metadata: dialogMetadata('ConfirmDialog'),
};

/** Form: a short capture that does not deserve a page of its own. */
export const formDialogTemplate: DialogTemplate = {
    name: 'FormDialog',
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.Actions }],
    content: {
        [TemplateSlotName.Header]: [externalComponent('form-dialog-frame', 'dialogFrame', { title: 'Invite someone' })],
        [TemplateSlotName.Body]: [
            field('form-dialog-email', 'Email', 'inputText', { placeholder: 'them@contoso.com' }),
            field('form-dialog-role', 'Role', 'dropdown', { options: ['Viewer', 'Editor', 'Administrator'] }),
            field('form-dialog-message', 'Message', 'inputTextarea', { rows: 3 }),
        ],
        [TemplateSlotName.Actions]: [
            panel('form-dialog-actions', [closingDialog(button('form-dialog-cancel', 'Cancel', { severity: 'secondary' })), button('form-dialog-send', 'Send invitation', { severity: 'primary' })]),
        ],
    },
    displayName: 'Form dialog',
    description: 'A handful of fields captured without leaving the page underneath.',
    metadata: dialogMetadata('FormDialog', true),
};

/** Detail: a record shown over the list it came from. */
export const detailDialogTemplate: DialogTemplate = {
    name: 'DetailDialog',
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.SidePanel }, { name: TemplateSlotName.Actions }],
    content: {
        [TemplateSlotName.Header]: [externalComponent('detail-dialog-frame', 'dialogFrame', { title: 'ORD-4192' })],
        [TemplateSlotName.Body]: [
            card('detail-dialog-summary', [
                text('detail-dialog-customer', 'Northwind Traders'),
                text('detail-dialog-total', '$1,240.00'),
                externalComponent('detail-dialog-status', 'tag', { value: 'Shipped', severity: 'success' }),
            ]),
        ],
        [TemplateSlotName.SidePanel]: [externalComponent('detail-dialog-timeline', 'timeline', { align: 'left' })],
        [TemplateSlotName.Actions]: [
            panel('detail-dialog-actions', [closingDialog(button('detail-dialog-close', 'Close', { severity: 'secondary' })), button('detail-dialog-open', 'Open full record', { severity: 'primary', targetScreen: 'DetailView' })]),
        ],
    },
    displayName: 'Detail dialog',
    description: 'A record over the list it came from, with a route to the full page.',
    metadata: dialogMetadata('DetailDialog', true),
};

/** The dialog templates this blueprint provides: the three the gallery began with, and the foundation's quick create, lookup, side sheet and filter dialogs. */
export const galleryDialogTemplates: DialogTemplate[] = [confirmDialogTemplate, formDialogTemplate, detailDialogTemplate, ...foundationDialogTemplates];
