// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { formScreenTemplate, quickCreateDialogTemplate } from '@cratis/scene.blueprint.default';
import { TicketingQuery, fromQuery, localeOfData } from '../ticketingQueries';
import { closesDialog, component, ticketingMetadata, withBehaviors } from '../ticketingParts';

const formScopes = [TemplateScope.Feature, TemplateScope.Subfeature];

/**
 * The agent's new-ticket form: the foundation `FormScreen` - sections of validated fields, Save, Save and new, Cancel and the unsaved-changes guard - for opening a
 * ticket on behalf of a customer who phoned or wrote somewhere else.
 */
export const ticketCreateFormTemplate: ScreenTemplate = {
    name: 'TicketCreateForm',
    fitsSlot: 'content',
    slots: formScreenTemplate.slots,
    arrangement: formScreenTemplate.arrangement,
    content: {
        header: [component('ticket-create-header', 'pageHeader', { title: 'New ticket', subtitle: 'Fields marked * are required' })],
        body: [component('ticket-create-body', 'formScreenBody', { mode: 'create', sections: fromQuery(TicketingQuery.TicketSections), errors: fromQuery(TicketingQuery.FormErrors, '0'), ...localeOfData })],
        actions: [],
    },
    displayName: 'New ticket',
    description: 'A form that opens a ticket on behalf of a customer.',
    metadata: ticketingMetadata('TicketCreateForm', 'Form', formScopes),
};

/**
 * The public-facing new-ticket form for a portal: the same foundation `FormScreen`, in the full-page layout so it has no application chrome, with only what a
 * customer can say - who they are, what is wrong and the details - and a notice that says what happens next. It carries no assignee, priority or status:
 * those are the agents'.
 */
export const ticketPortalFormTemplate: ScreenTemplate = {
    name: 'TicketPortalForm',
    fitsSlot: 'content',
    slots: formScreenTemplate.slots,
    arrangement: formScreenTemplate.arrangement,
    content: {
        header: [component('portal-header', 'pageHeader', { title: 'Contact support', subtitle: 'Tell us what is wrong and we will get back to you' })],
        body: [
            component('portal-notice', 'notice', { tone: 'info', title: 'What happens next', text: 'You will get an email with a reference. Replies to it are added to your ticket.' }),
            component('portal-body', 'formScreenBody', { mode: 'create', saveAndNew: false, sections: fromQuery(TicketingQuery.PortalSections), errors: fromQuery(TicketingQuery.FormErrors, '0'), strings: { formSave: 'Send' }, ...localeOfData }),
        ],
        actions: [],
    },
    displayName: 'New ticket (portal)',
    description: 'The public form a customer opens a ticket with, without application chrome.',
    metadata: ticketingMetadata('TicketPortalForm', 'Form', [TemplateScope.Application, TemplateScope.Module, TemplateScope.Feature, TemplateScope.Subfeature]),
};

interface DialogOptions {
    name: string;
    title: string;
    subtitle: string;
    sections: string;
    save: string;
    description: string;
}

/** One dialog: the foundation `QuickCreateDialog` frame with a short form and the label of its commit button. */
function dialogOf(options: DialogOptions): DialogTemplate {
    return {
        name: options.name,
        slots: quickCreateDialogTemplate.slots,
        content: {
            header: [component(`${options.name}-frame`, 'dialogFrame', { title: options.title, subtitle: options.subtitle })],
            body: [withBehaviors(component(`${options.name}-form`, 'formScreenBody', {
                mode: 'create', saveAndNew: false, strings: { formSave: options.save }, sections: fromQuery(options.sections), errors: fromQuery(TicketingQuery.FormErrors, '0'), ...localeOfData,
            }), closesDialog())],
            actions: [],
        },
        displayName: options.title,
        description: options.description,
        metadata: ticketingMetadata(options.name, 'Dialog', [TemplateScope.Slice]),
    };
}

/** The dialogs of the help desk: two quick-create dialogs for the lists and the four quick actions of a ticket page. */
export const ticketingDialogTemplates: DialogTemplate[] = [
    dialogOf({ name: 'TicketQuickCreate', title: 'New ticket', subtitle: 'Only what is needed to get started', sections: TicketingQuery.QuickSections, save: 'Create', description: 'A short form that opens a ticket without leaving the page.' }),
    dialogOf({ name: 'CustomerQuickCreate', title: 'New customer', subtitle: 'Only what is needed to get started', sections: TicketingQuery.CustomerQuickSections, save: 'Create', description: 'A short form that adds a customer without leaving the page.' }),
    dialogOf({ name: 'AssignTicket', title: 'Assign ticket', subtitle: 'Choose who works on it', sections: TicketingQuery.AssignSections, save: 'Assign', description: 'Assigns a ticket to an agent, with a note they will see.' }),
    dialogOf({ name: 'ChangeTicketStatus', title: 'Change status', subtitle: 'Say where the ticket stands', sections: TicketingQuery.StatusSections, save: 'Change status', description: 'Moves a ticket to another status, with a comment.' }),
    dialogOf({ name: 'EscalateTicket', title: 'Escalate ticket', subtitle: 'Hand it to the people who can fix it', sections: TicketingQuery.EscalateSections, save: 'Escalate', description: 'Raises a ticket to another team or level, with the reason.' }),
    dialogOf({ name: 'MergeTickets', title: 'Merge tickets', subtitle: 'Fold a duplicate into another ticket', sections: TicketingQuery.MergeSections, save: 'Merge', description: 'Merges a duplicate ticket into another one, keeping the conversation.' }),
];
