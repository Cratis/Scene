// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SliceKind, type ApplicationStructure } from '@cratis/scene.model';
import { createExternalComponent } from '../../Document/createExternalComponent';

const slice = (id: string, kind: SliceKind, extra: Record<string, unknown> = {}) => ({ id, name: id, kind, ...extra });

// Sales > Orders holds PlaceOrder and CancelOrder (state changes, one with its own dialog template), a state view and an automation; Support > Tickets holds two more.
export const application: ApplicationStructure = {
    modules: [
        { id: 'sales', name: 'Sales', slices: [slice('Onboard', SliceKind.StateChange)], features: [{ id: 'orders', name: 'Orders', features: [{ id: 'returns', name: 'Returns', features: [], slices: [slice('Refund', SliceKind.StateChange)] }], slices: [
            slice('PlaceOrder', SliceKind.StateChange, { command: 'PlaceOrderCommand' }), slice('CancelOrder', SliceKind.StateChange, { dialogTemplate: 'ConfirmDialog' }), slice('OrderSummary', SliceKind.StateView), slice('SendReminder', SliceKind.Automation),
        ] }] },
        { id: 'support', name: 'Support', features: [{ id: 'tickets', name: 'Tickets', features: [], slices: [slice('AssignTicket', SliceKind.StateChange), slice('OpenTicketsView', SliceKind.StateView)] }] },
    ],
};

// A button of an outlet of actions - the toolbar since Scene 5: a hand-typed command is its `command`, what it runs its `slice` (StudioIssues#1328).
export const button = (id: string, properties: Record<string, unknown>) => {
    const { kind: _, target, ...rest } = properties;
    return { kind: 'button', id, title: id, ...(target === undefined ? {} : { command: target }), ...rest };
};

export const toolbarOf = (...buttons: ReturnType<typeof button>[]) => createExternalComponent('toolbar', 'Toolbar', 'core:outletItems', { name: 'toolbar', kind: 'actions', items: buttons });
