// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionActionKind, InteractionTriggerKind, NotificationLevel, NotifyAction, ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { listScreenTemplate } from '@cratis/scene.blueprint.default';
import { InventoryEntityKind, fromQuery, inventoryQueriesOf, localeOfData } from '../inventoryQueries';
import { actionButton, component, goesTo, inventoryMetadata, opensDialog, opensRecordOnSelect, withBehaviors } from '../inventoryParts';

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
    entity: InventoryEntityKind;
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
    /** Rows are not selectable at all: a record of what happened, which nobody edits. */
    readOnly?: boolean;
    /** Show the records as cards, each with the picture its `imageField` names. */
    cards?: { imageField: string };
    /** Tint a row by the tone in this field (always beside a status column that says the same in words). */
    toneField?: string;
}

/**
 * One Inventory list: the foundation `ListScreen` with its header, toolbar, filters, list and bulk bar filled for an entity. The slots, arrangement and
 * every behavior - sort, search, paging and selection in the address, the table collapsing to cards on a phone - are the foundation's.
 */
function listTemplateOf(options: ListOptions): ScreenTemplate {
    const queries = inventoryQueriesOf(options.entity);
    const id = options.name;
    const listId = `${id}-records`;
    const primary = withBehaviors(actionButton(`${id}-primary`, options.primary.label, 'primary'), options.primary.dialog ? opensDialog(options.primary.dialog) : goesTo(options.primary.screen!));
    const list = component(listId, 'dataList', {
        label: options.title, rows: fromQuery(queries.rows), columns: fromQuery(queries.columns), titleField: options.titleField, pageSize: options.cards ? 12 : 10, urlKey: options.urlKey, ...localeOfData,
        rowActions: options.rowActions,
        ...(options.readOnly ? {} : { selectionMode: options.recordScreen ? 'single' : 'multiple' }),
        ...(options.cards ? { variant: 'cards', imageField: options.cards.imageField } : {}),
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
            bulkBar: options.recordScreen || options.readOnly ? [] : [component(`${id}-bulk`, 'bulkBar', { selection: fromQuery(queries.selection), actions: options.bulkActions })],
            footer: [],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: inventoryMetadata(options.name, 'List', listScopes),
    };
}

/** The items: what is stored, how much of it and where. Items running low are tinted and say "Low stock" in their status. Choosing a row opens the item. */
export const inventoryItemListTemplate = listTemplateOf({
    name: 'InventoryItemList', entity: InventoryEntityKind.Item, displayName: 'Inventory items', description: 'Items with sku, category, location, quantity and status, low stock highlighted, filtered by category, location and status.',
    title: 'Items', subtitle: 'Everything in stock, low stock highlighted', searchLabel: 'Search items', urlKey: 'items', primary: { label: 'New item', dialog: 'InventoryQuickCreateItem' },
    rowActions: ['Adjust stock', 'Check out', 'Archive'], bulkActions: [], titleField: 'name', recordScreen: 'inventory.items.record', toneField: 'tone',
});

/** The items as a gallery: the same records as cards, each with its picture, for finding a thing by how it looks. */
export const inventoryItemGalleryTemplate = listTemplateOf({
    name: 'InventoryItemGallery', entity: InventoryEntityKind.Item, displayName: 'Inventory item gallery', description: 'Items as cards with a picture, sku, quantity and status, low stock highlighted.',
    title: 'Item gallery', subtitle: 'Items by how they look', searchLabel: 'Search items', urlKey: 'gallery', primary: { label: 'New item', dialog: 'InventoryQuickCreateItem' },
    rowActions: ['Adjust stock', 'Check out', 'Archive'], bulkActions: [], titleField: 'name', recordScreen: 'inventory.items.record', toneField: 'tone', cards: { imageField: 'photo' },
});

/** The movements: every time stock came in, went out, moved or was corrected, newest first. Nothing in it is edited. */
export const inventoryMovementListTemplate = listTemplateOf({
    name: 'InventoryMovementList', entity: InventoryEntityKind.Movement, displayName: 'Inventory movements', description: 'Check ins, check outs, transfers and adjustments with the item, quantity, location and who did it.',
    title: 'Movements', subtitle: 'What came in, went out and moved', searchLabel: 'Search movements', urlKey: 'movements', primary: { label: 'Check in or out', screen: 'inventory.movements.check' },
    rowActions: ['View item'], bulkActions: [], titleField: 'item', readOnly: true,
});

/** The suppliers: who items are bought from, how to reach them and how many items they supply. */
export const inventorySupplierListTemplate = listTemplateOf({
    name: 'InventorySupplierList', entity: InventoryEntityKind.Supplier, displayName: 'Inventory suppliers', description: 'Suppliers with their contact, the items they supply and their status.',
    title: 'Suppliers', subtitle: 'Where the stock comes from', searchLabel: 'Search suppliers', urlKey: 'suppliers', primary: { label: 'New supplier', dialog: 'InventoryQuickCreateSupplier' },
    rowActions: ['Edit', 'Deactivate'], bulkActions: ['Deactivate'], titleField: 'name',
});
