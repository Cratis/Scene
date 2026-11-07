// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ExternalComponent, OutletItemKind } from '@cratis/scene.model';
import { coreComponents } from '../core';
import { SceneElementView } from '../SceneElementView';
import { navigationItemTarget } from '../outlets/OutletNavigationView';

const navigation = {
    id: 'sidebar', componentName: 'core:outletItems', slots: {},
    properties: {
        name: 'sidebar', kind: 'navigation', items: [
            { kind: OutletItemKind.Navigation, id: 'products', title: 'Products', icon: 'box', target: { screen: 'Catalog.Products' } },
            {
                kind: OutletItemKind.Navigation, id: 'more', title: 'More', children: [
                    { kind: OutletItemKind.Navigation, id: 'archived', title: 'Archived', target: { screen: 'Catalog.Archived' }, slot: 'detail' },
                ],
            },
        ],
    },
} as unknown as ExternalComponent;

describe('when drawing an outlet of navigation', () => {
    let navigations: { targetScreen: string; destination: { slot?: string }; item: string }[];
    const onNavigate = (event: Event) => navigations.push((event as CustomEvent).detail);

    afterEach(() => {
        globalThis.removeEventListener('cratis.scene.navigate', onNavigate);
        cleanup();
    });

    beforeEach(() => {
        navigations = [];
        globalThis.addEventListener('cratis.scene.navigate', onNavigate);
        render(<SceneElementView element={navigation as never} registry={coreComponents} />);
    });

    it('should draw the items with their sub-items nested', () =>
        Array.from(document.querySelectorAll('nav > ul > li')).map(node => node.getAttribute('data-scene-outlet-item')).should.deep.equal(['products', 'more']));
    it('should draw an item without a target as a heading', () =>
        [screen.queryByRole('button', { name: 'More' }), screen.getByText('More').className].should.deep.equal([null, 'scene-outlet-navigation-heading']));
    it('should carry the icon', () => (document.querySelector('[data-scene-icon-name="box"]') !== null).should.be.true);

    describe('and a sub-item is chosen outside a navigation host', () => {
        beforeEach(() => { fireEvent.click(screen.getByRole('button', { name: 'Archived' })); });

        it('should announce its target, in the slot the item names', () =>
            navigations.map(entry => [entry.targetScreen, entry.destination.slot, entry.item]).should.deep.equal([['Catalog.Archived', 'detail', 'archived']]));
    });

    describe('and an item names a slot its target already names', () => {
        it('should keep the target\'s', () =>
            navigationItemTarget({ kind: OutletItemKind.Navigation, id: 'x', title: 'X', target: { screen: 'S', slot: 'own' }, slot: 'other' })!.slot!.should.equal('own'));
    });
});
