// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { ApplicationStructure, ExternalComponent, NavigationModel, NavigationRegionKind, ToolbarEmphasis } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { coreComponents } from '../core';
import { NavigationRegionView } from '../navigation/region/NavigationRegionView';
import { SceneNavigationHost } from '../navigation/SceneNavigationHost';
import { SceneNavigationModel } from '../navigation/region/SceneNavigationModel';
import { NavigationActivationProvider } from '../navigation/NavigationActivationContext';
import { SliceCommandFieldsProvider } from '../slices/SliceCommandFieldsContext';

const structure = {
    modules: [
        { id: 'catalog', name: 'Catalog', features: [{ id: 'products', name: 'Products', features: [], slices: [{ id: 'DraftProduct', name: 'Draft product', kind: 'StateChange', command: 'DraftProduct' }] }] },
        { id: 'warehouse', name: 'Warehouse', features: [{ id: 'stock', name: 'Stock', features: [], slices: [] }] },
    ],
} as unknown as ApplicationStructure;

const navigation: NavigationModel = {
    application: {
        regions: [{
            region: NavigationRegionKind.Topbar,
            items: [{ id: 'catalog', title: 'Catalog', target: { module: 'catalog' } }],
            buttons: [
                { id: 'new-product', title: 'New product', slice: 'catalog.products.DraftProduct', emphasis: ToolbarEmphasis.Primary },
                { id: 'audit', title: 'Audit', slice: 'catalog.products.DraftProduct', authorize: 'Catalog.Auditor' },
                { id: 'soon', title: 'Coming soon' },
            ],
        }],
    },
    modules: [{ module: 'warehouse', regions: [{ region: NavigationRegionKind.Topbar, mode: 'extend', items: [], buttons: [{ id: 'count', title: 'Count stock', slice: 'catalog.products.DraftProduct' }] }] } as never],
};

const text = (id: string) => ({ id, componentName: 'core:text', properties: { text: id }, slots: {} }) as unknown as ExternalComponent;

function Application({ isAuthorized, withHost = true, initialScreen = 'catalog.products' }: { isAuthorized?(policy: string): boolean; withHost?: boolean; initialScreen?: string }) {
    const model: SceneNavigationModel = { structure: new ApplicationStructureIndex(structure), navigation, ...(isAuthorized ? { isAuthorized } : {}) };
    const region = <NavigationRegionView region={NavigationRegionKind.Topbar} />;
    if (!withHost) return <SceneNavigationHost navigationModel={model} screens={{ 'catalog.products': text('products') }} initialScreen='catalog.products' registry={coreComponents} />;
    return <SliceCommandFieldsProvider fieldsFor={() => [{ name: 'name', type: 'string' }]}>
        <SceneNavigationHost navigationModel={model} initialScreen={initialScreen} registry={coreComponents}
            screens={{ 'catalog.products': text('products'), 'warehouse.stock': text('stock') }}
            frame={content => <div>{region}<main>{content}</main></div>} />
    </SliceCommandFieldsProvider>;
}

const buttonNames = () => Array.from(document.querySelectorAll('[data-scene-nav-button]')).map(button => button.textContent);

describe('when a region declares application toolbar buttons', () => {
    afterEach(cleanup);

    describe('and no policy is checked', () => {
        beforeEach(() => { render(<Application />); });

        it('should show every button in order, after the items', () => buttonNames().should.deep.equal(['New product', 'Audit', 'Coming soon']));
        it('should carry the emphasis as the screen toolbar does', () =>
            [screen.getByRole('button', { name: 'New product' }).getAttribute('data-scene-emphasis'), screen.getByRole('button', { name: 'New product' }).className.includes('scene-toolbar-button-primary'), screen.getByRole('button', { name: 'Audit' }).getAttribute('data-scene-emphasis')]
                .should.deep.equal(['primary', true, 'secondary']));
        it('should say a slice button opens a dialog', () => screen.getByRole('button', { name: 'New product' }).getAttribute('aria-haspopup')!.should.equal('dialog'));
        it('should show a button without a slice disabled', () => (screen.getByRole('button', { name: 'Coming soon' }) as HTMLButtonElement).disabled.should.be.true);
        it('should group the buttons in a labelled group', () => screen.getByRole('group', { name: 'Topbar actions' }).getAttribute('data-scene-nav-buttons')!.should.equal('topbar'));
    });

    describe('and the button is pressed', () => {
        beforeEach(() => {
            render(<Application />);
            fireEvent.click(screen.getByRole('button', { name: 'New product' }));
        });

        it('should open the slice as a task dialog over the current page', () =>
            [screen.getByRole('dialog').getAttribute('aria-label'), screen.queryByText('products') !== null].should.deep.equal(['New product', true]));
    });

    describe('and a design host selects instead of navigating', () => {
        const selected: { source: string; id?: string; navigated: boolean }[] = [];
        const pressed: string[] = [];

        beforeEach(() => {
            selected.length = 0;
            pressed.length = 0;
            const model: SceneNavigationModel = { structure: new ApplicationStructureIndex(structure), navigation };
            render(<SliceCommandFieldsProvider fieldsFor={() => []}>
                <SceneNavigationHost navigationModel={model} initialScreen='catalog.products' registry={coreComponents} screens={{ 'catalog.products': text('products') }}
                    frame={content => <NavigationActivationProvider mode='select' onActivate={activation => selected.push({ source: activation.request.source, id: activation.request.id, navigated: activation.navigated })}>
                        <NavigationRegionView region={NavigationRegionKind.Topbar} onActivateButton={button => pressed.push(button.id)} />{content}
                    </NavigationActivationProvider>} />
            </SliceCommandFieldsProvider>);
            fireEvent.click(screen.getByRole('button', { name: 'New product' }));
        });

        it('should select the button, not open its dialog', () => [screen.queryByRole('dialog'), selected, pressed].should.deep.equal([null, [{ source: 'regionButton', id: 'new-product', navigated: false }], ['new-product']]));
    });

    describe('and a policy is checked', () => {
        const granted: string[] = [];
        beforeEach(() => { granted.length = 0; });

        it('should hide a button whose policy the user does not satisfy, and keep the others', () => {
            render(<Application isAuthorized={() => false} />);
            buttonNames().should.deep.equal(['New product', 'Coming soon']);
        });

        it('should show the button when the user satisfies the policy', () => {
            render(<Application isAuthorized={policy => { granted.push(policy); return true; }} />);
            [buttonNames(), granted].should.deep.equal([['New product', 'Audit', 'Coming soon'], ['Catalog.Auditor']]);
        });
    });

    describe('and the host has no navigation host to open a dialog in', () => {
        let commands: string[];
        const onCommand = (event: Event) => commands.push((event as CustomEvent).detail.command);

        beforeEach(() => {
            commands = [];
            globalThis.addEventListener('cratis.scene.command', onCommand);
            render(<NavigationRegionView region={NavigationRegionKind.Topbar} model={{ structure: new ApplicationStructureIndex(structure), navigation }} />);
            fireEvent.click(screen.getByRole('button', { name: 'New product' }));
        });

        afterEach(() => globalThis.removeEventListener('cratis.scene.command', onCommand));

        it('should announce the slice instead', () => commands.should.deep.equal(['catalog.products.DraftProduct']));
    });

    describe('and the region is a module that extends the application', () => {
        beforeEach(() => { render(<Application initialScreen='warehouse.stock' />); });

        it('should show the application buttons then the module buttons', () => buttonNames().should.deep.equal(['New product', 'Audit', 'Coming soon', 'Count stock']));
        it('should say an inherited button is read-only and where it came from', () =>
            [screen.getByRole('button', { name: 'New product' }).getAttribute('data-read-only'), screen.getByRole('button', { name: 'Count stock' }).getAttribute('data-origin')].should.deep.equal(['true', 'module']));
    });
});
