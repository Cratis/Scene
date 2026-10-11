// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ExternalComponent, SceneElement } from '@cratis/scene.model';
import { coreComponents } from '../core';
import { useSceneNavigation } from '../navigation';
import { SceneNavigationHost } from '../navigation/SceneNavigationHost';
import { SceneElementView } from '../SceneElementView';

const element = (id: string, componentName: string, properties: Record<string, unknown> = {}, slots: Record<string, SceneElement[]> = {}) =>
    ({ id, componentName, properties, slots }) as unknown as ExternalComponent;

const toolbar = element('toolbar', 'core:toolbar', { name: 'main' }, {
    items: [
        element('edit', 'core:toolbarItem', { name: 'edit', kind: 'Action', target: 'EditInvoice', label: 'Edit', icon: 'edit', parameters: { invoiceId: { path: 'invoice.id' } }, presentation: { placement: 'primary' } }),
        element('details', 'core:toolbarItem', { name: 'details', kind: 'Navigate', target: 'InvoiceDetails', label: 'Details', presentation: { mode: 'icon' }, icon: 'info', parameters: { invoiceId: { path: 'invoice.id' } } }),
        element('open', 'core:toolbarItem', { name: 'open', kind: 'Navigate', target: 'InvoiceDetails', label: 'Open', destination: { screen: 'InvoiceDetails', outlet: 'detail', kind: 'outlet', routeParameterBindings: { id: { path: 'invoice.id' } } } }),
        element('help', 'core:toolbarItem', { name: 'help', kind: 'Dialog', target: 'HelpDialog', label: 'Help' }),
    ],
});

describe('when activating toolbar items', () => {
    afterEach(cleanup);

    describe('outside a navigation host', () => {
        let commands: { command: string; arguments: Record<string, unknown> }[];
        let navigations: { targetScreen: string; dialog?: string; destination: { routeParameterBindings?: Record<string, { value?: unknown }> } }[];
        const onCommand = (event: Event) => commands.push((event as CustomEvent).detail);
        const onNavigate = (event: Event) => navigations.push((event as CustomEvent).detail);

        beforeEach(() => {
            commands = [];
            navigations = [];
            globalThis.addEventListener('cratis.scene.command', onCommand);
            globalThis.addEventListener('cratis.scene.navigate', onNavigate);
            render(<SceneElementView registry={coreComponents} dataContext={{ invoice: { id: 'i-7' } }} element={toolbar as never} />);
        });

        afterEach(() => {
            globalThis.removeEventListener('cratis.scene.command', onCommand);
            globalThis.removeEventListener('cratis.scene.navigate', onNavigate);
        });

        it('should render a toolbar of its items', () => screen.getByRole('toolbar', { name: 'main' }).querySelectorAll('button').length.should.equal(4));

        it('should announce an action with its resolved parameters', () => {
            fireEvent.click(screen.getByText('Edit'));
            commands.map(command => [command.command, command.arguments]).should.deep.equal([['EditInvoice', { invoiceId: 'i-7' }]]);
        });

        it('should announce a navigation to its screen', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Details' }));
            navigations[0].targetScreen.should.equal('InvoiceDetails');
        });

        it('should resolve the route parameters it was given against the scope it renders in', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Details' }));
            navigations[0].destination.routeParameterBindings!.invoiceId.value!.should.equal('i-7');
        });

        it('should resolve the bindings of an authored destination against the scope it renders in', () => {
            fireEvent.click(screen.getByText('Open'));
            [navigations[0].destination.routeParameterBindings!.id.value, (navigations[0].destination as { outlet?: string }).outlet].should.deep.equal(['i-7', 'detail']);
        });

        it('should announce a dialog', () => {
            fireEvent.click(screen.getByText('Help'));
            navigations[0].dialog!.should.equal('HelpDialog');
        });

        it('should show only the icon of an icon-only item and keep its label as the accessible name', () => {
            const item = screen.getByRole('button', { name: 'Details' });
            [item.getAttribute('data-scene-mode'), item.textContent].should.deep.equal(['icon', '']);
        });

        it('should carry presentation hints on the node', () => screen.getByText('Edit').getAttribute('data-scene-presentation-placement')!.should.equal('primary'));
    });

    describe('inside a navigation host', () => {
        function Where() {
            const navigation = useSceneNavigation();
            return <output aria-label='where'>{JSON.stringify({ screen: navigation.currentScreen, dialog: navigation.currentDialog ?? null })}</output>;
        }

        beforeEach(() => {
            render(<SceneNavigationHost
                initialScreen='Home'
                registry={{ ...coreComponents, 'test:where': Where }}
                screens={{
                    Home: { id: 'home', children: [toolbar, element('where', 'test:where')] } as never,
                    InvoiceDetails: element('details-screen', 'test:where'),
                }}
                dialogs={{ HelpDialog: element('help-dialog', 'core:text', { text: 'Help text' }) }} />);
        });

        it('should open a dialog destination through the host', () => {
            act(() => { fireEvent.click(screen.getByText('Help')); });
            JSON.parse(screen.getByLabelText('where').textContent!).dialog.should.equal('HelpDialog');
        });

        it('should open a screen destination through the host', () => {
            act(() => { fireEvent.click(screen.getByRole('button', { name: 'Details' })); });
            JSON.parse(screen.getByLabelText('where').textContent!).screen.should.equal('InvoiceDetails');
        });
    });
});
