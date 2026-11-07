// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ExternalComponent, SceneElement } from '@cratis/scene.model';
import { coreComponents } from '../core';
import { SceneElementView } from '../SceneElementView';
import { SceneSlotContext } from '../navigation/SceneSlotContext';
import { SceneRouterProvider, SceneRouteState } from '../routing';

const element = (id: string, componentName: string, properties: Record<string, unknown> = {}, slots: Record<string, SceneElement[]> = {}) =>
    ({ id, componentName, properties, slots }) as unknown as ExternalComponent;

const page = element('page', 'core:section', {}, {
    content: [
        element('detail', 'core:slot', { name: 'detail', role: 'pane', routed: true, routedBy: ['sku'], optional: true }),
        element('activity', 'core:slot', { name: 'activity', role: 'panel', optional: true }),
        element('main', 'core:slot', { name: 'main' }),
        element('comments', 'core:slot', { name: 'comments', role: 'panel' }),
    ],
});
const screens = { ProductDetails: element('details', 'core:text', { text: 'Nordic Kettle' }) };

function renderPage(initialState: SceneRouteState) {
    render(<SceneRouterProvider initialState={initialState}>
        <SceneSlotContext.Provider value={{ screens, registry: coreComponents }}>
            <SceneElementView element={page as never} registry={coreComponents} />
        </SceneSlotContext.Provider>
    </SceneRouterProvider>);
}

const slot = (name: string) => document.querySelector(`[data-scene-slot="${name}"]`);

describe('when drawing slots by role', () => {
    afterEach(cleanup);

    describe('and the routed pane shows nothing', () => {
        beforeEach(() => renderPage({ slots: {}, tabs: {}, query: {} }));

        it('should hide an optional slot until something fills it', () => [slot('detail'), slot('activity')].should.deep.equal([null, null]));
        it('should draw a slot that is not optional as a region', () => slot('main')!.className.should.equal('scene-slot scene-slot-region'));
        it('should draw a panel as a landmark docked beside the content', () =>
            screen.getByRole('complementary', { name: 'comments' }).className.should.equal('scene-slot scene-slot-panel'));
    });

    describe('and the router says what the routed pane shows', () => {
        beforeEach(() => renderPage({ slots: { detail: { screen: 'ProductDetails', parameters: { sku: 'NK-101' }, segment: 'set-product-price' } }, tabs: {}, query: {} }));

        it('should show the screen', () => slot('detail')!.getAttribute('data-scene-slot-screen')!.should.equal('ProductDetails'));
        it('should carry its role and route', () =>
            [slot('detail')!.getAttribute('data-scene-slot-role'), slot('detail')!.getAttribute('data-scene-slot-route')].should.deep.equal(['pane', 'NK-101/set-product-price']));

        describe('and it is closed', () => {
            beforeEach(() => { fireEvent.click(screen.getByRole('button', { name: 'Close' })); });

            it('should empty it through the router', () => (slot('detail') === null).should.be.true);
        });
    });

    describe('and the router lists something for a panel', () => {
        beforeEach(() => renderPage({ slots: { activity: { screen: 'ProductDetails', parameters: {} } }, tabs: {}, query: {} }));

        it('should not show it, because a panel is not routed', () => (slot('activity') === null).should.be.true);
    });
});
