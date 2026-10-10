// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingSourceKind, DestinationKind, DestinationReference, ExternalComponent, SceneElement } from '@cratis/scene.model';
import { RegisteredComponentProps } from '../../renderer';
import { useSceneNavigation } from '../../navigation/SceneNavigationContext';

function NavigationButton({ element }: RegisteredComponentProps) {
    const navigation = useSceneNavigation();
    return <button type='button' onClick={() => navigation.navigate(element.properties.destination as DestinationReference)}>{String(element.properties.label)}</button>;
}

function CloseButton({ element }: RegisteredComponentProps) {
    const navigation = useSceneNavigation();
    return <button type='button' onClick={() => navigation.closeDialog(element.properties.result)}>{String(element.properties.label)}</button>;
}

/** Shows where the host is, so a spec can read it from the rendered page. */
function Location({ element }: RegisteredComponentProps) {
    const navigation = useSceneNavigation();
    return <output aria-label={String(element.properties.label)}>
        {JSON.stringify({ screen: navigation.currentScreen, parameters: navigation.currentParameters, returned: navigation.dialogResult ?? null, unresolved: navigation.unresolvedUrl ?? null })}
    </output>;
}

export const registry = { 'test:navigate': NavigationButton, 'test:close': CloseButton, 'test:location': Location };

const component = (id: string, componentName: string, properties: Record<string, unknown>, slots: Record<string, SceneElement[]> = {}) =>
    ({ id, componentName, properties, slots }) as unknown as ExternalComponent;
const page = (id: string, ...children: SceneElement[]) => component(id, 'test:page', {}, { content: children });

/** The invoice destination: a route override, a bound path parameter and a query parameter. */
export const openInvoice: DestinationReference = {
    screen: 'InvoiceDetails',
    module: 'billing',
    feature: 'invoices',
    route: 'billing/invoices/{invoiceId}',
    outlet: 'content',
    routeParameterBindings: {
        invoiceId: { kind: BindingSourceKind.DataContext, path: 'invoice.id' },
        tab: { kind: BindingSourceKind.Literal, path: '', value: 'lines' },
    },
};

export const destinations: DestinationReference[] = [openInvoice, { screen: 'Invoices', route: 'billing/invoices', outlet: 'content' }];

export const screens: Record<string, SceneElement> = {
    Invoices: page('invoices',
        component('invoices.location', 'test:location', { label: 'location' }),
        component('invoices.open', 'test:navigate', { label: 'Open INV-7', destination: openInvoice })),
    InvoiceDetails: page('details',
        component('details.location', 'test:location', { label: 'location' }),
        component('details.void', 'test:navigate', { label: 'Void invoice', destination: { kind: DestinationKind.Dialog, dialog: 'ConfirmVoid' } }),
        component('details.back', 'test:navigate', { label: 'All invoices', destination: destinations[1] })),
};

export const dialogs: Record<string, SceneElement> = {
    ConfirmVoid: page('confirm', component('confirm.yes', 'test:close', { label: 'Void it', result: { confirmed: true } })),
};

export const bindingScope = { dataContext: { invoice: { id: 'INV 7' } } };

/** The page component: renders its content slot. */
export function Page({ slots }: RegisteredComponentProps) {
    return <main>{slots.content}</main>;
}

export const fullRegistry = { ...registry, 'test:page': Page };
