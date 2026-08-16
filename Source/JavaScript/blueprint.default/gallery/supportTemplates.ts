// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate } from '@cratis/scene.model';
import { SlotName } from '../layouts';
import { TemplateSlotName } from './TemplateSlotName';
import { button, card, externalComponent, text } from './elements';
import { field, formActions, pageHeader, table, widget } from './widgets';

/**
 * The five shapes an application needs that are not the CRUD loop: documentation, the signed-in user's own
 * settings, user administration, a printable document, and help.
 *
 * They are in the set because leaving them out is what makes a template line feel thin. Every real
 * application grows all five, and the ones that were never designed are the ones that end up looking like
 * a different product.
 */

/** Documentation: a table of contents beside prose. */
export const documentationTemplate: ScreenTemplate = {
    name: 'Documentation',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.SidePanel }, { name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.SidePanel]: [
            widget('docs-toc', 'On this page', [
                text('docs-toc-1', 'Getting started'),
                text('docs-toc-2', 'Configuring the shell'),
                text('docs-toc-3', 'Themes'),
                text('docs-toc-4', 'Publishing a blueprint'),
            ]),
        ],
        [TemplateSlotName.Body]: [
            pageHeader('docs-header', 'Getting started', 'Everything you need to run the blueprint locally'),
            card('docs-body', [
                text('docs-intro', 'Install the blueprint, add it to a ui profile, and pick a layout. The shell reads its mode from the configurator and remembers it.'),
                externalComponent('docs-note', 'message', { severity: 'info', text: 'The shell needs its stylesheet imported once, at the host.' }),
            ]),
        ],
    },
    displayName: 'Documentation',
    description: 'Prose with a table of contents beside it.',
};

/** Profile settings: the signed-in user editing their own account. */
export const profileSettingsTemplate: ScreenTemplate = {
    name: 'ProfileSettings',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.Actions }],
    content: {
        [TemplateSlotName.Header]: [pageHeader('profile-header', 'Your profile', 'How you appear to everyone else in the workspace')],
        [TemplateSlotName.Body]: [
            card('profile-identity', [
                externalComponent('profile-avatar', 'avatar', { label: 'AN', size: 'large', shape: 'circle' }),
                field('profile-name', 'Display name', 'inputText', { value: 'Amelia Nyquist' }),
                field('profile-email', 'Email', 'inputText', { value: 'amelia@contoso.com' }),
                externalComponent('profile-photo', 'image', { alt: 'Your current photo' }),
                button('profile-photo-change', 'Change photo', { severity: 'secondary' }),
            ]),
            card('profile-security', [
                field('profile-current', 'Current password', 'password', {}),
                field('profile-new', 'New password', 'password', { feedback: true }),
                field('profile-notify', 'Email me about mentions', 'checkbox', { checked: true }),
            ]),
        ],
        [TemplateSlotName.Actions]: [formActions('profile-actions', 'Save changes')],
    },
    displayName: 'Profile settings',
    description: 'The signed-in user editing their own name, photo, password and notifications.',
};

/** User management: administering everybody else. */
export const userManagementTemplate: ScreenTemplate = {
    name: 'UserManagement',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Toolbar }, { name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.Toolbar]: [
            pageHeader('users-header', 'Users', '34 people, 3 pending invitations', [button('users-invite', 'Invite people', { severity: 'primary', icon: 'pi pi-user-plus' })]),
        ],
        [TemplateSlotName.Body]: [
            table(
                'users-table',
                [
                    { field: 'name', header: 'Name' },
                    { field: 'email', header: 'Email' },
                    { field: 'role', header: 'Role' },
                    { field: 'status', header: 'Status' },
                    { field: 'lastSeen', header: 'Last seen' },
                ],
                [
                    { name: 'Amelia Nyquist', email: 'amelia@contoso.com', role: 'Owner', status: 'Active', lastSeen: '2 minutes ago' },
                    { name: 'Bjørn Holt', email: 'bjorn@contoso.com', role: 'Administrator', status: 'Active', lastSeen: 'Yesterday' },
                    { name: 'Chidi Okafor', email: 'chidi@contoso.com', role: 'Editor', status: 'Active', lastSeen: '3 days ago' },
                    { name: 'Dana Whitfield', email: 'dana@contoso.com', role: 'Viewer', status: 'Invited', lastSeen: 'Never' },
                ],
            ),
        ],
    },
    displayName: 'User management',
    description: 'The people table, with roles, status and an invitation action.',
};

/** Invoice: a printable document, which is a different shape from a screen. */
export const invoiceTemplate: ScreenTemplate = {
    name: 'Invoice',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.Actions }],
    content: {
        [TemplateSlotName.Header]: [
            pageHeader('invoice-header', 'Invoice INV-2043', 'Issued 4 March · Due 3 April', [button('invoice-print', 'Print', { severity: 'secondary', icon: 'pi pi-print' })]),
        ],
        [TemplateSlotName.Body]: [
            card('invoice-parties', [
                text('invoice-from', 'From: Contoso Ltd, 4 Chandler Street, Dublin'),
                text('invoice-to', 'To: Northwind Traders, 18 Quay Road, Cork'),
            ]),
            table(
                'invoice-lines',
                [
                    { field: 'description', header: 'Description' },
                    { field: 'quantity', header: 'Quantity' },
                    { field: 'unitPrice', header: 'Unit price' },
                    { field: 'amount', header: 'Amount' },
                ],
                [
                    { description: 'Bamboo Watch', quantity: 12, unitPrice: '$65.00', amount: '$780.00' },
                    { description: 'Blue Band', quantity: 4, unitPrice: '$79.00', amount: '$316.00' },
                    { description: 'Expedited shipping', quantity: 1, unitPrice: '$144.00', amount: '$144.00' },
                ],
            ),
            card('invoice-total', [text('invoice-subtotal', 'Subtotal: $1,240.00'), text('invoice-vat', 'VAT (23%): $285.20'), text('invoice-due', 'Total due: $1,525.20')]),
        ],
        [TemplateSlotName.Actions]: [formActions('invoice-actions', 'Mark as paid', 'Send reminder')],
    },
    displayName: 'Invoice',
    description: 'A printable document: parties, line items and totals.',
};

/** Help: the answers, and a way to ask when they are not there. */
export const helpTemplate: ScreenTemplate = {
    name: 'Help',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.SidePanel }],
    content: {
        [TemplateSlotName.Header]: [pageHeader('help-header', 'Help', 'Search the answers, or ask us directly')],
        [TemplateSlotName.Body]: [
            externalComponent('help-search', 'inputText', { placeholder: 'Search help' }),
            widget('help-popular', 'Popular answers', [
                text('help-1', 'How do I invite someone to the workspace?'),
                text('help-2', 'Why can I not see the sidebar on my phone?'),
                text('help-3', 'How do I change the theme?'),
            ]),
        ],
        [TemplateSlotName.SidePanel]: [
            widget('help-contact', 'Still stuck?', [text('help-contact-text', 'We answer within one working day.'), button('help-contact-button', 'Contact support', { severity: 'primary' })]),
        ],
    },
    displayName: 'Help',
    description: 'Searchable answers with a route to a human.',
};

/** The five support templates. */
export const supportTemplates: ScreenTemplate[] = [documentationTemplate, profileSettingsTemplate, userManagementTemplate, invoiceTemplate, helpTemplate];
