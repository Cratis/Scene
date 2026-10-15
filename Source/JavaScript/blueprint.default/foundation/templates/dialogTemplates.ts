// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Behavior, DialogTemplate, ExternalComponent, InteractionActionKind, InteractionTriggerKind } from '@cratis/scene.model';
import { panel } from '../../gallery/elements';
import { defaultBlueprintTemplateProvenance } from '../../templateProvenance';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/** What a Cancel or Close control does: close the dialog the screen opened it from, in Scene, in Stage and in the preview alike. */
export const closeDialogBehaviors: Behavior[] = [{ bindings: [{ trigger: { kind: InteractionTriggerKind.Click }, actions: [{ kind: InteractionActionKind.CloseDialog }] }] }];

/** An element that closes the dialog when it is clicked. */
export const closingDialog = <T extends ExternalComponent>(element: T): T => ({ ...element, behaviors: closeDialogBehaviors });

/**
 * The provenance, type and category every foundation dialog carries. A dialog built from the foundation and core components needs no component library; one that
 * uses PrimeReact widgets (`needsPrimeReact`) declares the packages it requires.
 */
export const dialogMetadata = (name: string, needsPrimeReact = false) =>
    ({ ...(needsPrimeReact ? defaultBlueprintTemplateProvenance : foundationTemplateProvenance), type: 'Dialog', category: 'Foundation / Dialog', thumbnail: thumbnailOf(name) });

/** One action of the foundation, by the id it is known by. */
export const actionButton = (id: string, properties: Record<string, unknown>): ExternalComponent => component(id, 'actionButton', properties);

/** The footer of a dialog: its buttons, the one that confirms last, so it is the one the eye ends on. */
export const dialogActions = (id: string, buttons: ExternalComponent[]) => panel(`${id}-actions`, buttons);

/**
 * The quick-create dialog: a short form - six fields at most - opened from a list's header or from a lookup, to make one record without leaving the page.
 * Cancel closes it, Create validates and saves. `FormDialog` is the general form dialog this one is the focused form of: the same shape with the heading,
 * focus handling and the form of the foundation, which is why it is offered as the alias a quick-create button chooses.
 */
export const quickCreateDialogTemplate: DialogTemplate = {
    name: 'QuickCreateDialog',
    slots: [{ name: 'header' }, { name: 'body' }, { name: 'actions' }],
    content: {
        header: [component('quick-create-frame', 'dialogFrame', { title: 'New contact', subtitle: 'Only what is needed to get started' })],
        body: [closingDialog(component('quick-create-form', 'formScreenBody', {
            mode: 'create', saveAndNew: false, strings: { formSave: 'Create' },
            sections: fromQuery('QuickCreateSections'), values: fromQuery('QuickCreateValues', '0'), errors: fromQuery('FormErrors', '0'),
        }))],
        actions: [],
    },
    displayName: 'Quick create',
    description: 'A short form of six fields at most with Cancel and Create, opened without leaving the page.',
    metadata: dialogMetadata('QuickCreateDialog'),
};

/**
 * The lookup dialog: search, a table or list, and single or multiple selection, with Cancel and Select. Any lookup field opens it, so one dialog serves them all;
 * `selectionMode` on the list is `single` (the default here) or `multiple`.
 */
export const lookupDialogTemplate: DialogTemplate = {
    name: 'LookupDialog',
    slots: [{ name: 'header' }, { name: 'body' }, { name: 'actions' }],
    content: {
        header: [component('lookup-frame', 'dialogFrame', { title: 'Select an account', subtitle: 'Search, then choose one' })],
        body: [
            component('lookup-search', 'globalSearch', { placeholder: 'Search accounts', label: 'Search accounts' }),
            component('lookup-list', 'dataList', { label: 'Accounts', rows: fromQuery('LookupRows'), columns: fromQuery('LookupColumns'), titleField: 'name', selectionMode: 'single', pageSize: 6 }),
        ],
        actions: [dialogActions('lookup', [
            closingDialog(actionButton('lookup-cancel', { label: 'Cancel', emphasis: 'secondary' })),
            closingDialog(actionButton('lookup-select', { label: 'Select', emphasis: 'primary' })),
        ])],
    },
    displayName: 'Lookup',
    description: 'A search and a list to choose one or several records from, with Cancel and Select.',
    metadata: dialogMetadata('LookupDialog'),
};

/**
 * The side sheet: a drawer from the inline end with a header, a scrollable body and footer actions. It hosts what a page hosts - a form, or a record's
 * tabs and related records - so a record can be edited or read from beside the list it came from.
 */
export const sideSheetTemplate: DialogTemplate = {
    name: 'SideSheet',
    slots: [{ name: 'header' }, { name: 'body' }, { name: 'actions' }],
    content: {
        header: [component('sheet-frame', 'dialogFrame', { title: 'Account details', subtitle: 'Edit without leaving the list', placement: 'side' })],
        body: [closingDialog(component('sheet-form', 'formScreenBody', { mode: 'edit', sections: fromQuery('RecordSections'), values: fromQuery('RecordValues', '0'), errors: fromQuery('FormErrors', '0') }))],
        actions: [dialogActions('sheet', [
            closingDialog(actionButton('sheet-close', { label: 'Close', emphasis: 'secondary' })),
            actionButton('sheet-open', { label: 'Open full page', emphasis: 'primary', targetScreen: 'RecordPage' }),
        ])],
    },
    displayName: 'Side sheet',
    description: 'A drawer from the side hosting a record or a form, with footer actions.',
    metadata: dialogMetadata('SideSheet'),
};

/**
 * The filter dialog: the advanced filter builder in a dialog. On a phone it fills the page, which makes it the phone's alternative to the filter panel
 * a list shows beside its table.
 */
export const filterDialogTemplate: DialogTemplate = {
    name: 'FilterDialog',
    slots: [{ name: 'header' }, { name: 'body' }, { name: 'actions' }],
    content: {
        header: [component('filter-frame', 'dialogFrame', { title: 'Filters', subtitle: 'Show only the deals that match' })],
        body: [component('filter-builder', 'filterBuilder', { fields: fromQuery('DealFilterFields'), filter: fromQuery('DealFilter', '0') })],
        actions: [dialogActions('filter', [
            actionButton('filter-reset', { label: 'Reset', emphasis: 'secondary' }),
            closingDialog(actionButton('filter-cancel', { label: 'Cancel', emphasis: 'secondary' })),
            closingDialog(actionButton('filter-apply', { label: 'Apply filters', emphasis: 'primary' })),
        ])],
    },
    displayName: 'Filters',
    description: 'The advanced filter builder in a dialog, the phone alternative to the filter panel.',
    metadata: dialogMetadata('FilterDialog'),
};

/** The dialogs the foundation adds to the three the gallery already had. */
export const foundationDialogTemplates: DialogTemplate[] = [quickCreateDialogTemplate, lookupDialogTemplate, sideSheetTemplate, filterDialogTemplate];
