// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach } from 'vitest';
import { SceneElement } from '@cratis/scene.model';
import { EffectiveNavItem } from '@cratis/scene.engine';
import { NavigationApplication } from './given/navigation_application';
import { navigation, structure } from './given/support_application';

const text = (id: string) => ({ id, componentName: 'test:text', properties: {}, slots: {} }) as unknown as SceneElement;

// A host whose screens carry the names their authors gave them, and which says where each was declared.
const declared: Record<string, string> = { OverviewScreen: 'dashboard.overview', OrderScreen: 'sales.orders', CustomerScreen: 'sales.customers' };
const screens = Object.fromEntries(Object.keys(declared).map(name => [name, text(name)]));
const screenFor = (item: EffectiveNavItem) => Object.entries(declared).find(([, feature]) => feature === item.target?.resolvedFeature)?.[0];
const moduleOf = (screen: string | undefined) => screen === undefined ? undefined : declared[screen]?.split('.')[0];

const links = (container: HTMLElement, region: string) => Array.from(container.querySelectorAll(`nav[data-scene-nav-region="${region}"] [data-scene-nav-link]`)).map(link => link.textContent);
const link = (container: HTMLElement, name: string) => Array.from(container.querySelectorAll<HTMLElement>('[data-scene-nav-link]')).find(candidate => candidate.textContent === name)!;

describe('when the screens of the application are not named by their qualified id', () => {
    afterEach(cleanup);

    let container: HTMLElement;
    beforeEach(() => {
        ({ container } = render(<NavigationApplication structure={structure} navigation={navigation} initialScreen='OverviewScreen' screens={screens} screenFor={screenFor} moduleOf={moduleOf} />));
    });

    it('should show the navigation of the application on a screen outside every module', () => links(container, 'sidebar').should.not.include('Customers'));

    describe('and a module is opened from the topbar', () => {
        beforeEach(() => { fireEvent.click(link(container, 'Sales')); });

        it('should open the screen the host names for the first feature', () => container.querySelector('main [data-screen]')!.getAttribute('data-screen')!.should.equal('OrderScreen'));
        it('should show the sidebar of the module the host says the screen is in', () => links(container, 'sidebar').should.include.members(['Orders', 'Customers']));
        it('should mark the page in the sidebar', () => link(container, 'Orders').getAttribute('aria-current')!.should.equal('page'));
    });
});
