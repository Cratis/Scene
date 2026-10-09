// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { BindingSourceKind, DestinationKind, DestinationReference, ExternalComponent, SceneElement } from '@cratis/scene.model';
import { RegisteredComponentProps } from '../renderer';
import { SceneNavigationHost } from '../navigation/SceneNavigationHost';
import { useSceneNavigation } from '../navigation/SceneNavigationContext';

function NavigationButton({ element }: RegisteredComponentProps) {
    const navigation = useSceneNavigation();
    return <button type='button' onClick={() => navigation.navigate(element.properties.destination as DestinationReference)}>{String(element.properties.label)}</button>;
}

function ScreenText({ element }: RegisteredComponentProps) {
    const navigation = useSceneNavigation();
    return <span>{String(element.properties.text)} {navigation.currentUrl}</span>;
}

const registry = {
    'test:navigate': NavigationButton,
    'test:text': ScreenText,
};

function component(id: string, componentName: string, properties: Record<string, unknown>): SceneElement {
    return { id, componentName, properties, slots: {} } as unknown as ExternalComponent;
}

describe('when composing hierarchical destinations', () => {
    it('should execute screen deep links outlets and dialogs through the rendered hierarchy', () => {
        const home = component('home', 'test:navigate', {
            label: 'Open details',
            destination: {
                screen: 'Details',
                module: 'sales',
                feature: 'orders',
                slice: 'details',
                route: 'sales/orders/{orderId}',
                outlet: 'content',
                routeParameterBindings: { orderId: { kind: BindingSourceKind.DataContext, path: 'order.id' } },
            },
        });
        const details = component('details', 'test:navigate', {
            label: 'Open confirm',
            destination: { kind: DestinationKind.Dialog, dialog: 'ConfirmDelete' },
        });
        const dialog = component('dialog', 'test:text', { text: 'Confirm delete' });

        const rendered = render(<SceneNavigationHost
            initialScreen='Home'
            screens={{ Home: home, Details: details }}
            dialogs={{ ConfirmDelete: dialog }}
            registry={registry}
            bindingScope={{ dataContext: { order: { id: 'order-2' } } }} />);

        fireEvent.click(screen.getByText('Open details'));
        rendered.container.querySelector('[data-scene-outlet="content"]')!.getAttribute('data-scene-url')!.should.equal('sales/orders/order-2');
        Boolean(screen.getByText('Open confirm')).should.equal(true);
        fireEvent.click(screen.getByText('Open confirm'));
        Boolean(screen.getByRole('dialog')).should.equal(true);
        Boolean(screen.getByText('Confirm delete sales/orders/order-2')).should.equal(true);
    });
});
