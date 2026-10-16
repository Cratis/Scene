// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { formScreenTemplate, quickCreateDialogTemplate } from '@cratis/scene.blueprint.default';
import { InventoryQuery, currencyOfData, fromQuery, localeOfData } from '../inventoryQueries';
import { closesDialog, component, inventoryMetadata, withBehaviors } from '../inventoryParts';

/**
 * Check in or out, made for a phone held in one hand beside a shelf: one column of large fields, the item first - scanned or searched for in the same field -
 * then the direction, how many, who has it and when it is due back. The foundation `FormScreen` supplies the sections, validation, Save and the unsaved-changes
 * guard; what is particular here is that nothing is arranged side by side.
 */
export const inventoryCheckInOutTemplate: ScreenTemplate = {
    name: 'InventoryCheckInOut',
    fitsSlot: 'content',
    slots: formScreenTemplate.slots,
    arrangement: formScreenTemplate.arrangement,
    content: {
        header: [component('InventoryCheckInOut-header', 'pageHeader', { title: 'Check in or out', subtitle: 'Scan or search for the item first' })],
        body: [component('InventoryCheckInOut-body', 'formScreenBody', {
            mode: 'create', saveAndNew: true, strings: { formSave: 'Record movement' }, sections: fromQuery('CheckInOutSections'), errors: fromQuery(InventoryQuery.FormErrors, '0'), ...currencyOfData,
        })],
        actions: [],
    },
    displayName: 'Inventory check in and out',
    description: 'A mobile-first form to scan or search for an item and check it in or out, with who has it and when it is due back.',
    metadata: inventoryMetadata('InventoryCheckInOut', 'Form', [TemplateScope.Feature, TemplateScope.Subfeature]),
};

/** The screen templates that are forms. */
export const inventoryFormTemplates: ScreenTemplate[] = [inventoryCheckInOutTemplate];

/**
 * One quick-create dialog: the foundation `QuickCreateDialog` - a short form opened from a page to make one record without leaving it - with the fields
 * that thing needs to get started.
 */
function quickCreateOf(name: string, title: string, subtitle: string, sections: string, noun: string, create: string): DialogTemplate {
    return {
        name,
        slots: quickCreateDialogTemplate.slots,
        content: {
            header: [component(`${name}-frame`, 'dialogFrame', { title, subtitle })],
            body: [withBehaviors(component(`${name}-form`, 'formScreenBody', {
                mode: 'create', saveAndNew: false, strings: { formSave: create }, sections: fromQuery(sections), errors: fromQuery(InventoryQuery.FormErrors, '0'), ...localeOfData,
            }), closesDialog())],
            actions: [],
        },
        displayName: `Inventory quick create ${noun}`,
        description: `A short form that ${noun === 'stock adjustment' ? 'adjusts the stock of one item' : `creates one ${noun}`} without leaving the page.`,
        metadata: inventoryMetadata(name, 'Dialog', [TemplateScope.Slice]),
    };
}

/** Adjust stock (an item, a quantity change and a reason), and the quick creation of an item and of a supplier. */
export const inventoryQuickCreateDialogs: DialogTemplate[] = [
    quickCreateOf('InventoryAdjustStock', 'Adjust stock', 'Count what is on the shelf and say why it changed', 'AdjustStockSections', 'stock adjustment', 'Adjust'),
    quickCreateOf('InventoryQuickCreateItem', 'New item', 'Only what is needed to get started', 'ItemQuickSections', 'item', 'Create'),
    quickCreateOf('InventoryQuickCreateSupplier', 'New supplier', 'Only what is needed to get started', 'SupplierQuickSections', 'supplier', 'Create'),
];
