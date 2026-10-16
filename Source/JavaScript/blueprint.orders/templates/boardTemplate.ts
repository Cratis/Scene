// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { boardScreenTemplate } from '@cratis/scene.blueprint.default';
import { OrdersEntityKind, OrdersQuery, fromQuery, localeOfData, ordersQueriesOf } from '../ordersQueries';
import { actionButton, component, opensDialog, ordersMetadata, withBehaviors } from '../ordersParts';

/**
 * The fulfilment board: the foundation `BoardScreen` with a column for each step an order goes through - new, picking, shipped, delivered - and a card for each
 * order with its customer, delivery date and channel. An order moves to the next step by dragging or by its own Move-to menu, and the columns say in words when
 * a limit is exceeded.
 */
export const fulfilmentBoardTemplate: ScreenTemplate = {
    name: 'OrdersFulfilmentBoard',
    fitsSlot: 'content',
    slots: boardScreenTemplate.slots,
    arrangement: boardScreenTemplate.arrangement,
    content: {
        header: [component('OrdersFulfilmentBoard-header', 'pageHeader', { title: 'Fulfilment', subtitle: 'Drag an order to its next step' }, {
            actions: [withBehaviors(actionButton('OrdersFulfilmentBoard-new', 'New order', 'primary'), opensDialog('OrdersQuickCreateOrder'))],
        })],
        toolbar: [
            component('OrdersFulfilmentBoard-search', 'globalSearch', { placeholder: 'Search the board', label: 'Search the board' }),
            component('OrdersFulfilmentBoard-views', 'savedViewsMenu', { views: fromQuery(ordersQueriesOf(OrdersEntityKind.Order).views), savePermission: 'enabled', managePermission: 'enabled' }),
        ],
        board: [component('OrdersFulfilmentBoard-columns', 'kanbanBoard', {
            columns: fromQuery(OrdersQuery.FulfilmentColumns), cards: fromQuery(OrdersQuery.FulfilmentCards), editPermission: 'enabled', label: 'Orders by fulfilment step', ...localeOfData,
        })],
    },
    displayName: 'Orders fulfilment board',
    description: 'Orders as cards in a column for each fulfilment step, moved by dragging or by menu.',
    metadata: ordersMetadata('OrdersFulfilmentBoard', 'Board', [TemplateScope.Module, TemplateScope.Feature]),
};
