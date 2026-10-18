// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { boardScreenTemplate } from '@cratis/scene.blueprint.default';
import { WorkOrdersEntityKind, WorkOrdersQuery, fromQuery, localeOfData, workOrdersQueriesOf } from '../workOrdersQueries';
import { actionButton, component, workOrdersMetadata, opensDialog, withBehaviors } from '../workOrdersParts';

interface BoardOptions {
    name: string;
    displayName: string;
    description: string;
    title: string;
    subtitle: string;
    searchLabel: string;
    label: string;
    entity: WorkOrdersEntityKind;
    columns: string;
    cards: string;
    primary: { label: string; dialog: string };
}

/**
 * One board: the foundation `BoardScreen` with a column for each step and a card for each record. A card moves to another step by dragging or by its own Move-to menu,
 * and a column says in words when its limit is exceeded.
 */
function boardOf(options: BoardOptions): ScreenTemplate {
    const id = options.name;
    return {
        name: options.name,
        fitsSlot: 'content',
        slots: boardScreenTemplate.slots,
        arrangement: boardScreenTemplate.arrangement,
        content: {
            header: [component(`${id}-header`, 'pageHeader', { title: options.title, subtitle: options.subtitle }, {
                actions: [withBehaviors(actionButton(`${id}-new`, options.primary.label, 'primary'), opensDialog(options.primary.dialog))],
            })],
            toolbar: [
                component(`${id}-search`, 'globalSearch', { placeholder: options.searchLabel, label: options.searchLabel }),
                component(`${id}-views`, 'savedViewsMenu', { views: fromQuery(workOrdersQueriesOf(options.entity).views), savePermission: 'enabled', managePermission: 'enabled' }),
            ],
            board: [component(`${id}-columns`, 'kanbanBoard', { columns: fromQuery(options.columns), cards: fromQuery(options.cards), editPermission: 'enabled', label: options.label, ...localeOfData })],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: workOrdersMetadata(options.name, 'Board', [TemplateScope.Module, TemplateScope.Feature]),
    };
}

/** The work orders board: a column for each step a work order goes through and a card for each work order with its job, site and priority. */
export const workOrdersBoardTemplate = boardOf({
    name: 'WorkOrdersBoard', displayName: 'Work orders board', description: 'Work orders as cards in a column for each step, moved by dragging or by menu.', title: 'Board', subtitle: 'Drag a work order to its next step', searchLabel: 'Search the board', label: 'Work orders by step',
    entity: WorkOrdersEntityKind.WorkOrder, columns: WorkOrdersQuery.BoardColumns, cards: WorkOrdersQuery.BoardCards, primary: { label: 'New work order', dialog: 'WorkOrdersQuickCreateWorkOrder' },
});
