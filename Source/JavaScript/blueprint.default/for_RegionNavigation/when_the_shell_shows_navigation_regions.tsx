// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { renderShell } from './given';

describe('when the shell shows navigation regions', () => {
    afterEach(cleanup);

    describe('and the application supplies a navigation model', () => {
        let container: HTMLElement;

        beforeEach(() => {
            ({ container } = render(renderShell('sales.orders')));
        });

        it('should show the topbar modules as the shell menu', () =>
            Array.from(container.querySelectorAll('.layout-region-topbar .layout-menu-item')).map(item => item.textContent).should.deep.equal(['Dashboard', 'Sales', 'Support']));

        it('should show the sidebar of the module on the page', () =>
            Array.from(container.querySelectorAll('.layout-region-sidebar > .layout-menu > .layout-menu-item')).map(item => item.getAttribute('data-scene-nav-item')).should.deep.equal(['orders', 'customers']));

        it('should mark the module of the page in the topbar and the page in the sidebar', () =>
            [container.querySelector('.layout-region-topbar [data-active="true"]')!.textContent, container.querySelector('.layout-region-sidebar [data-active="true"]')!.getAttribute('data-scene-nav-item')].should.deep.equal(['Sales', 'orders']));

        it('should use the same classes as the shell menu so its stylesheet applies', () =>
            container.querySelector('.layout-region-sidebar .layout-menu-link[aria-current="page"]')!.classList.contains('layout-menu-link').should.be.true);

        it('should open the module of an item and swap the sidebar to it', () => {
            fireEvent.click(screen.getByRole('link', { name: 'Support' }));
            Array.from(container.querySelectorAll('.layout-region-sidebar > .layout-menu > .layout-menu-item')).map(item => item.getAttribute('data-scene-nav-item')).should.deep.equal(['tickets', 'kb']);
        });

        it('should render the opened screen in the primary slot', () => {
            fireEvent.click(screen.getByRole('link', { name: 'Support' }));
            container.querySelector('main [data-screen]')!.getAttribute('data-screen')!.should.equal('support.tickets');
        });

        it('should render an item with a slot into the nested outlet and keep both highlighted', () => {
            fireEvent.click(screen.getByRole('link', { name: 'Support' }));
            fireEvent.click(screen.getByRole('link', { name: 'Knowledge base' }));
            [container.querySelector('[data-scene-outlet="side"] [data-screen]')!.getAttribute('data-screen'),
                Array.from(container.querySelectorAll('.layout-region-sidebar [data-active="true"]')).map(item => item.getAttribute('data-scene-nav-item'))]
                .should.deep.equal(['support.kb', ['tickets', 'kb']]);
        });
    });
});
