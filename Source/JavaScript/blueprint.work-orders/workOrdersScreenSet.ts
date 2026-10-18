// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`workorders.list.record` would be the `record` feature of `list`). */
export interface WorkOrdersScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const workOrdersScreenDefinitions: WorkOrdersScreenDefinition[] = [
    { name: 'workorders.list', title: 'Work orders', template: 'WorkOrdersList', order: 0, description: 'Every work order with its site, priority, assignee and status.' },
    { name: 'workorders.record', title: 'Work order', template: 'WorkOrderPage', parent: 'workorders.list', description: 'One work order: key facts, its tasks, the parts used, the time logged and its activity.' },
    { name: 'workorders.board', title: 'Board', template: 'WorkOrdersBoard', order: 1, description: 'Work orders in a column for each step: new, scheduled, in progress and done.' },
    { name: 'workorders.schedule', title: 'Schedule', template: 'WorkOrdersSchedule', order: 2, description: 'The day each work order is planned, on a calendar.' },
];
