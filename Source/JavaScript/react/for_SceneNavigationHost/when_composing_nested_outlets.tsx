// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BindingSourceKind, DestinationReference, ExternalComponent, SceneElement } from '@cratis/scene.model';
import { coreComponents } from '../core';
import { RegisteredComponentProps } from '../renderer';
import { SceneNavigationHost } from '../navigation/SceneNavigationHost';
import { createHashSceneHistory } from '../navigation/createHashSceneHistory';
import { useSceneNavigation } from '../navigation/SceneNavigationContext';

/**
 * Three levels of recursive composition: the Orders workspace declares a `detail` outlet, the order shown
 * there declares a `line` outlet, and a line opens into it. Each level stays on the page while the next
 * opens inside it.
 */
function Navigate({ element }: RegisteredComponentProps) {
    const navigation = useSceneNavigation();
    return <button type='button' onClick={() => navigation.navigate(element.properties.destination as DestinationReference)}>{String(element.properties.label)}</button>;
}

function Heading({ element }: RegisteredComponentProps) {
    return <h2>{String(element.properties.text)}</h2>;
}

function Page({ slots }: RegisteredComponentProps) {
    return <section>{slots.content}</section>;
}

const registry = { ...coreComponents, 'test:navigate': Navigate, 'test:heading': Heading, 'test:page': Page };
const element = (id: string, componentName: string, properties: Record<string, unknown> = {}) => ({ id, componentName, properties, slots: {} }) as unknown as ExternalComponent;
const page = (id: string, ...children: SceneElement[]) => ({ id, componentName: 'test:page', properties: {}, slots: { content: children } }) as unknown as ExternalComponent;

const order: DestinationReference = { screen: 'OrderDetails', outlet: 'detail', route: 'orders/{orderId}', routeParameterBindings: { orderId: { kind: BindingSourceKind.Literal, path: '', value: 'ORD-7' } } };
const line: DestinationReference = { screen: 'OrderLine', outlet: 'line', route: 'orders/{orderId}/lines/{lineId}', routeParameterBindings: {
    orderId: { kind: BindingSourceKind.Literal, path: '', value: 'ORD-7' }, lineId: { kind: BindingSourceKind.Literal, path: '', value: 'L-2' },
} };
const customers: DestinationReference = { screen: 'Customers' };

const screens = {
    Orders: page('orders', element('orders.heading', 'test:heading', { text: 'Orders' }), element('orders.open', 'test:navigate', { label: 'Open ORD-7', destination: order }),
        element('orders.customers', 'test:navigate', { label: 'Customers', destination: customers }), element('orders.detail', 'core:outlet', { name: 'detail' })),
    OrderDetails: page('details', element('details.heading', 'test:heading', { text: 'Order ORD-7' }), element('details.open', 'test:navigate', { label: 'Open line L-2', destination: line }),
        element('details.line', 'core:outlet', { name: 'line' })),
    OrderLine: page('line', element('line.heading', 'test:heading', { text: 'Line L-2' })),
    Customers: page('customers', element('customers.heading', 'test:heading', { text: 'Customers' })),
};

const headings = () => screen.queryAllByRole('heading').map(heading => heading.textContent);
const host = () => <SceneNavigationHost screens={screens} initialScreen='Orders' registry={registry} destinations={[order, line, customers]} history={createHashSceneHistory(window)} />;

describe('when composing nested outlets', () => {
    beforeEach(() => window.history.replaceState(null, '', '/app/index.html'));
    afterEach(cleanup);

    it('should show only the workspace before anything opens', () => {
        render(host());
        headings().should.deep.equal(['Orders']);
    });

    it('should open each level inside the one above it', () => {
        render(host());
        fireEvent.click(screen.getByText('Open ORD-7'));
        headings().should.deep.equal(['Orders', 'Order ORD-7']);
        fireEvent.click(screen.getByText('Open line L-2'));
        headings().should.deep.equal(['Orders', 'Order ORD-7', 'Line L-2']);
        window.location.hash.should.equal('#/orders/ORD-7/lines/L-2');
        document.querySelector('[data-scene-outlet="detail"] [data-scene-outlet="line"] h2')!.textContent!.should.equal('Line L-2');
    });

    it('should compose every level from a deep link', () => {
        window.history.replaceState(null, '', '/app/index.html#/orders/ORD-7/lines/L-2');
        render(host());
        headings().should.deep.equal(['Orders', 'Order ORD-7', 'Line L-2']);
    });

    it('should close the innermost level on back', async () => {
        render(host());
        fireEvent.click(screen.getByText('Open ORD-7'));
        fireEvent.click(screen.getByText('Open line L-2'));
        await act(async () => {
            const popped = new Promise(resolve => window.addEventListener('popstate', resolve, { once: true }));
            window.history.back();
            await popped;
        });
        headings().should.deep.equal(['Orders', 'Order ORD-7']);
    });

    it('should replace the whole composition when a screen opens outside it', () => {
        render(host());
        fireEvent.click(screen.getByText('Open ORD-7'));
        fireEvent.click(screen.getByText('Customers'));
        headings().should.deep.equal(['Customers']);
    });
});
