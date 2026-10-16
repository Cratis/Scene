// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionActionKind, InteractionTriggerKind, NotificationLevel, NotifyAction, ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { listScreenTemplate } from '@cratis/scene.blueprint.default';
import { OrdersEntityKind, fromQuery, ordersQueriesOf, localeOfData } from '../ordersQueries';
import { actionButton, component, goesTo, ordersMetadata, opensDialog, opensRecordOnSelect, withBehaviors } from '../ordersParts';

const listScopes = [TemplateScope.Module, TemplateScope.Feature];

/** The Export button: it tells the user the export has started, which is what the shell does for a long-running action it does not wait on. */
const exportAction = (id: string) => withBehaviors(actionButton(id, 'Export', 'secondary'), [{
    bindings: [{
        trigger: { kind: InteractionTriggerKind.Click },
        actions: [{ kind: InteractionActionKind.Notify, level: NotificationLevel.Info, message: { text: 'The export has started.' } } as unknown as NotifyAction],
    }],
}]);

interface ListOptions {
    name: string;
    entity: OrdersEntityKind;
    displayName: string;
    description: string;
    title: string;
    subtitle: string;
    searchLabel: string;
    urlKey: string;
    /** The primary action of the header: a quick-create dialog to open, or a screen to go to. */
    primary: { label: string; dialog?: string; screen?: string };
    rowActions: string[];
    bulkActions: string[];
    titleField: string;
    /** The screen a chosen row opens; the list then selects one row at a time. Absent, rows are selected many at a time for the bulk bar. */
    recordScreen?: string;
    /** The side sheet a chosen row opens instead of a record page; the list then selects one row at a time. */
    recordDialog?: string;
    /** Group the rows (`variant: grouped`) by this field. */
    grouped?: { groupBy: string };
    /** Rows are not selectable at all: a record of what happened, which nobody edits. */
    readOnly?: boolean;
    /** Show the records as cards, each with the picture its `imageField` names. */
    cards?: { imageField?: string };
    /** Tint a row by the tone in this field (always beside a status column that says the same in words). */
    toneField?: string;
}

/**
 * One orders list: the foundation `ListScreen` with its header, toolbar, filters, list and bulk bar filled for an entity. The slots, arrangement and
 * every behavior - sort, search, paging and selection in the address, the table collapsing to cards on a phone - are the foundation's.
 */
function listTemplateOf(options: ListOptions): ScreenTemplate {
    const queries = ordersQueriesOf(options.entity);
    const id = options.name;
    const listId = `${id}-records`;
    const primary = withBehaviors(actionButton(`${id}-primary`, options.primary.label, 'primary'), options.primary.dialog ? opensDialog(options.primary.dialog) : goesTo(options.primary.screen!));
    const list = component(listId, 'dataList', {
        label: options.title, rows: fromQuery(queries.rows), columns: fromQuery(queries.columns), titleField: options.titleField, pageSize: options.cards ? 12 : 10, urlKey: options.urlKey, ...localeOfData,
        rowActions: options.rowActions,
        ...(options.readOnly ? {} : { selectionMode: options.recordScreen || options.recordDialog ? 'single' : 'multiple' }),
        ...(options.cards ? { variant: 'cards', ...(options.cards.imageField ? { imageField: options.cards.imageField } : {}) } : {}),
        ...(options.grouped ? { variant: 'grouped', groupBy: options.grouped.groupBy } : {}),
        ...(options.toneField ? { toneField: options.toneField } : {}),
    });

    return {
        name: options.name,
        fitsSlot: 'content',
        slots: listScreenTemplate.slots,
        arrangement: listScreenTemplate.arrangement,
        content: {
            header: [component(`${id}-header`, 'pageHeader', { title: options.title, subtitle: options.subtitle }, { actions: [exportAction(`${id}-export`), primary] })],
            toolbar: [
                component(`${id}-search`, 'globalSearch', { placeholder: options.searchLabel, label: options.searchLabel, urlKey: `${options.urlKey}q` }),
                component(`${id}-views`, 'savedViewsMenu', { views: fromQuery(queries.views), savePermission: 'enabled', managePermission: 'enabled' }),
                component(`${id}-columns`, 'columnChooser', { columns: fromQuery(queries.columnChoices) }),
            ],
            filters: [component(`${id}-filter`, 'filterBuilder', { fields: fromQuery(queries.filterFields), ...localeOfData })],
            list: [options.recordScreen ? withBehaviors(list, opensRecordOnSelect(listId, options.recordScreen)) : list],
            bulkBar: options.recordScreen || options.recordDialog || options.readOnly ? [] : [component(`${id}-bulk`, 'bulkBar', { selection: fromQuery(queries.selection), actions: options.bulkActions })],
            footer: [],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: ordersMetadata(options.name, 'List', listScopes),
    };
}

/** The orders: every order with its customer, dates, total and status, filtered by customer, status and channel. Choosing an order opens it. */
export const ordersListTemplate = listTemplateOf({
    name: 'OrdersList', entity: OrdersEntityKind.Order, displayName: 'Orders list', description: 'Every order with customer, placed and delivery dates, total and status, filtered by customer, status, channel and date.',
    title: 'Orders', subtitle: 'Everything customers have ordered', searchLabel: 'Search orders', urlKey: 'orders', primary: { label: 'New order', dialog: 'OrdersQuickCreateOrder' },
    rowActions: ['Open', 'Cancel order'], bulkActions: [], titleField: 'number', recordScreen: 'orders.record',
});
