// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { NavigationRegionKind } from '@cratis/scene.model';
import { EffectiveNavItem } from '@cratis/scene.engine';
import { NavigationApplication } from './given/navigation_application';
import { navigation, structure } from './given/support_application';

const link = (container: HTMLElement, name: string) => Array.from(container.querySelectorAll<HTMLElement>('[data-scene-nav-link]')).find(candidate => candidate.textContent === name)!;
const active = (container: HTMLElement, region: NavigationRegionKind) =>
    Array.from(container.querySelectorAll(`nav[data-scene-nav-region="${region}"] li[data-active="true"]`)).map(item => item.getAttribute('data-scene-nav-item'));
const shown = (container: HTMLElement) => container.querySelector('main [data-screen]')!.getAttribute('data-screen');

describe('when navigating through the topbar and sidebar of an application', () => {
    afterEach(cleanup);

    describe('and the topbar module item is activated', () => {
        let container: HTMLElement;

        beforeEach(() => {
            ({ container } = render(<NavigationApplication structure={structure} navigation={navigation} initialScreen='dashboard.overview' />));
            fireEvent.click(link(container, 'Sales'));
        });

        it('should open the first feature of the module in the primary slot', () => shown(container)!.should.equal('sales.orders'));
        it('should mark the module active in the topbar', () => active(container, NavigationRegionKind.Topbar).should.deep.equal(['sales']));
        it('should recompute the sidebar for the module', () => container.querySelector('nav[data-scene-nav-region="sidebar"]')!.getAttribute('data-scene-nav-module')!.should.equal('sales'));
        it('should show the module items of the sidebar', () =>
            Array.from(container.querySelectorAll('nav[data-scene-nav-region="sidebar"] > ul > li')).map(item => item.getAttribute('data-scene-nav-item')).should.deep.equal(['orders', 'customers']));
        it('should mark the page in the sidebar with aria-current', () => link(container, 'Orders').getAttribute('aria-current')!.should.equal('page'));
        it('should expand the parent of the active item', () => container.querySelector('li[data-scene-nav-item="orders"]')!.getAttribute('data-expanded')!.should.equal('true'));
        it('should keep the module of the topbar active on another screen of the module', () => {
            fireEvent.click(link(container, 'Customers'));
            active(container, NavigationRegionKind.Topbar).should.deep.equal(['sales']);
        });
    });

    describe('and a sub-item is activated', () => {
        let container: HTMLElement;

        beforeEach(() => {
            ({ container } = render(<NavigationApplication structure={structure} navigation={navigation} initialScreen='sales.customers' />));
            fireEvent.click(screen.getByRole('button', { name: 'Expand Orders' }));
            fireEvent.click(link(container, 'Returns'));
        });

        it('should open the sub-feature', () => shown(container)!.should.equal('sales.orders.returns'));
        it('should mark the sub-item active', () => active(container, NavigationRegionKind.Sidebar).should.deep.equal(['returns']));
        it('should mark its parent as holding the active item', () => container.querySelector('li[data-scene-nav-item="orders"]')!.getAttribute('data-active-descendant')!.should.equal('true'));
    });

    describe('and the sidebar parent is collapsed by the user', () => {
        let container: HTMLElement;

        beforeEach(() => {
            ({ container } = render(<NavigationApplication structure={structure} navigation={navigation} initialScreen='sales.orders.returns' />));
            fireEvent.click(screen.getByRole('button', { name: 'Collapse Orders' }));
        });

        it('should hide the sub-items', () => (container.querySelector('li[data-scene-nav-item="returns"]') === null).should.be.true);
        it('should say it is collapsed', () => screen.getByRole('button', { name: 'Expand Orders' }).getAttribute('aria-expanded')!.should.equal('false'));
    });

    describe('and items render into different slots', () => {
        let container: HTMLElement;

        beforeEach(() => {
            ({ container } = render(<NavigationApplication structure={structure} navigation={navigation} initialScreen='support.tickets' outlets={{ 'support.tickets': ['side'] }} />));
            fireEvent.click(link(container, 'Knowledge base'));
        });

        it('should keep the main screen and place the other in the side slot', () =>
            [shown(container), container.querySelector('[data-scene-outlet="side"] [data-screen]')!.getAttribute('data-screen')].should.deep.equal(['support.tickets', 'support.kb']));
        it('should mark both sidebar items active at once', () => active(container, NavigationRegionKind.Sidebar).should.deep.equal(['tickets', 'kb']));
        it('should mark the topbar item that renders into the slot active too', () => active(container, NavigationRegionKind.Topbar).should.include('help'));
    });

    describe('and the module is swapped', () => {
        let container: HTMLElement;
        let topbar: Element;
        let sidebar: Element;

        beforeEach(() => {
            ({ container } = render(<NavigationApplication structure={structure} navigation={navigation} initialScreen='sales.orders' />));
            topbar = container.querySelector('nav[data-scene-nav-region="topbar"]')!;
            sidebar = container.querySelector('nav[data-scene-nav-region="sidebar"]')!;
            fireEvent.click(link(container, 'Support'));
        });

        it('should keep the same navigation nodes instead of remounting them', () =>
            [container.querySelector('nav[data-scene-nav-region="topbar"]') === topbar, container.querySelector('nav[data-scene-nav-region="sidebar"]') === sidebar].should.deep.equal([true, true]));
        it('should apply the new module navigation', () =>
            Array.from(container.querySelectorAll('nav[data-scene-nav-region="sidebar"] > ul > li')).map(item => item.getAttribute('data-scene-nav-item')).should.deep.equal(['tickets', 'kb']));
        it('should extend the topbar with the module items', () =>
            Array.from(container.querySelectorAll('nav[data-scene-nav-region="topbar"] > ul > li')).map(item => item.getAttribute('data-scene-nav-item')).should.deep.equal(['dashboard', 'sales', 'support', 'help']));
        it('should say the inherited topbar items are read-only', () =>
            container.querySelector('nav[data-scene-nav-region="topbar"] li[data-scene-nav-item="sales"]')!.getAttribute('data-read-only')!.should.equal('true'));
        it('should say where the sidebar items come from', () => sidebar.getAttribute('data-scene-nav-sources-label')!.should.equal('Support only'));
    });

    describe('and a permission predicate hides items', () => {
        let container: HTMLElement;

        beforeEach(() => {
            const hideKnowledgeBase = (item: EffectiveNavItem) => item.id !== 'kb' && item.id !== 'returns';
            ({ container } = render(<NavigationApplication structure={structure} navigation={navigation} initialScreen='support.tickets' isVisible={hideKnowledgeBase} />));
        });

        it('should hide the item rather than disable it', () => (container.querySelector('li[data-scene-nav-item="kb"]') === null).should.be.true);
        it('should keep the others', () => Boolean(link(container, 'Tickets')).should.be.true);
        it('should hide a sub-item too', () => {
            cleanup();
            ({ container } = render(<NavigationApplication structure={structure} navigation={navigation} initialScreen='sales.orders' isVisible={item => item.id !== 'returns'} />));
            (container.querySelector('li[data-scene-nav-item="returns"]') === null).should.equal(true);
        });
    });

    describe('and an inherited item is rendered for a design layer', () => {
        it('should let the host add content to the item without forking the renderer', () => {
            const { container } = render(<NavigationApplication structure={structure} navigation={navigation} initialScreen='support.tickets'
                regions={[{ region: NavigationRegionKind.Topbar, renderAdornment: item => item.readOnly ? <i data-lock /> : null }]} />);
            container.querySelectorAll('[data-lock]').length.should.equal(3);
        });
    });

    describe('and the keyboard is used', () => {
        let container: HTMLElement;

        const press = (name: string, key: string) => {
            const element = link(container, name);
            element.focus();
            fireEvent.keyDown(element, { key });
        };

        beforeEach(() => {
            ({ container } = render(<NavigationApplication structure={structure} navigation={navigation} initialScreen='sales.orders' />));
        });

        it('should move right through the topbar', () => {
            press('Dashboard', 'ArrowRight');
            (document.activeElement as HTMLElement).textContent!.should.equal('Sales');
        });

        it('should move left through the topbar and stop at the first item', () => {
            press('Dashboard', 'ArrowLeft');
            (document.activeElement as HTMLElement).textContent!.should.equal('Dashboard');
        });

        it('should jump to the last topbar item with End', () => {
            press('Dashboard', 'End');
            (document.activeElement as HTMLElement).textContent!.should.equal('Support');
        });

        it('should jump back to the first with Home', () => {
            press('Support', 'Home');
            (document.activeElement as HTMLElement).textContent!.should.equal('Dashboard');
        });

        it('should move down through the sidebar into the expanded sub-items', () => {
            press('Orders', 'ArrowDown');
            (document.activeElement as HTMLElement).textContent!.should.equal('Returns');
        });

        it('should collapse a parent with left and expand it with right', () => {
            press('Orders', 'ArrowLeft');
            container.querySelector('li[data-scene-nav-item="orders"]')!.getAttribute('data-expanded')!.should.equal('false');
            press('Orders', 'ArrowRight');
            container.querySelector('li[data-scene-nav-item="orders"]')!.getAttribute('data-expanded')!.should.equal('true');
        });

        it('should go to the parent with left from a sub-item', () => {
            press('Returns', 'ArrowLeft');
            (document.activeElement as HTMLElement).textContent!.should.equal('Orders');
        });

        it('should keep exactly one item of a region in the tab order', () =>
            container.querySelectorAll('nav[data-scene-nav-region="topbar"] [data-scene-nav-link][tabindex="0"]').length.should.equal(1));
    });
});
