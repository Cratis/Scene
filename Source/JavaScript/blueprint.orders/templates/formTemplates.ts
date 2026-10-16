// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, TemplateScope } from '@cratis/scene.model';
import { quickCreateDialogTemplate } from '@cratis/scene.blueprint.default';
import { OrdersQuery, fromQuery, localeOfData } from '../ordersQueries';
import { closesDialog, component, ordersMetadata, withBehaviors } from '../ordersParts';

/**
 * One quick-create dialog: the foundation `QuickCreateDialog` - a short form opened from a page to make one record without leaving it - with the fields
 * that thing needs to get started.
 */
function quickCreateOf(name: string, title: string, sections: string, noun: string): DialogTemplate {
    return {
        name,
        slots: quickCreateDialogTemplate.slots,
        content: {
            header: [component(`${name}-frame`, 'dialogFrame', { title, subtitle: 'Only what is needed to get started' })],
            body: [withBehaviors(component(`${name}-form`, 'formScreenBody', {
                mode: 'create', saveAndNew: false, strings: { formSave: 'Create' }, sections: fromQuery(sections), errors: fromQuery(OrdersQuery.FormErrors, '0'), ...localeOfData,
            }), closesDialog())],
            actions: [],
        },
        displayName: `Orders quick create ${noun}`,
        description: `A short form that creates one ${noun} without leaving the page.`,
        metadata: ordersMetadata(name, 'Dialog', [TemplateScope.Slice]),
    };
}

/** The quick creation of an order. */
export const ordersDialogs: DialogTemplate[] = [
    quickCreateOf('OrdersQuickCreateOrder', 'New order', 'OrderQuickSections', 'order'),
];
