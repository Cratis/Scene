// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render } from '@testing-library/react';
import { afterEach } from 'vitest';
import { DestinationKind, NavigationRegionKind } from '@cratis/scene.model';
import { ApplicationStructureIndex, effectiveNavigation } from '@cratis/scene.engine';
import { createMemorySceneHistory } from '../navigation/createMemorySceneHistory';
import { SceneNavigationHost } from '../navigation/SceneNavigationHost';
import { NavigationRegionView } from '../navigation/region/NavigationRegionView';
import { navigationDestinations } from '../navigation/region/navigationDestinations';
import { navigationItemDestination } from '../navigation/region/navigationItemDestination';
import { navigationItemActive } from '../navigation/region/navigationItemActive';
import { registry, screensOf } from './given/navigation_application';
import { navigation, structure } from './given/support_application';

const index = new ApplicationStructureIndex(structure);
const item = (module: string | undefined, region: NavigationRegionKind, id: string) => effectiveNavigation(index, navigation, module, region).items.find(candidate => candidate.id === id)!;

describe('when deriving the destination of a navigation item', () => {
    afterEach(cleanup);

    it('should carry the module and feature identity and the screen of a feature target', () =>
        navigationItemDestination(item('support', NavigationRegionKind.Sidebar, 'tickets'))!.should.deep.equal({ kind: DestinationKind.Outlet, module: 'support', feature: 'tickets', screen: 'support.tickets' }));

    it('should resolve a module target to the first feature of the module', () =>
        navigationItemDestination(item(undefined, NavigationRegionKind.Topbar, 'sales'))!.should.deep.equal({ kind: DestinationKind.Outlet, module: 'sales', feature: 'orders', screen: 'sales.orders' }));

    it('should render into the slot the item names as the outlet', () =>
        navigationItemDestination(item('support', NavigationRegionKind.Sidebar, 'kb'))!.outlet!.should.equal('side'));

    it('should not name an outlet for the primary content slot', () =>
        ('outlet' in navigationItemDestination(item('support', NavigationRegionKind.Sidebar, 'tickets'))!).should.be.false);

    it('should let the host name the screens', () =>
        navigationItemDestination(item('support', NavigationRegionKind.Sidebar, 'tickets'), () => 'TicketsScreen')!.screen!.should.equal('TicketsScreen'));

    it('should lead nowhere when the item has no target', () =>
        (navigationItemDestination({ id: 'group', title: 'Group', slot: 'content', origin: 'application', readOnly: false, reason: '' } as never) === undefined).should.be.true);

    it('should list every destination of every module and region once, so deep links resolve', () => {
        const destinations = navigationDestinations(index, navigation);
        destinations.map(destination => destination.screen).sort().should.deep.equal(
            ['dashboard.overview', 'sales.customers', 'sales.orders', 'sales.orders.returns', 'support.kb', 'support.tickets']);
    });

    it('should not change what is active outside the slot an item renders into', () =>
        navigationItemActive(item('support', NavigationRegionKind.Sidebar, 'kb'), { primaryScreen: 'support.kb', outlets: {} }).should.be.false);

    it('should open a deep link of a navigation item inside its slot', () => {
        const history = createMemorySceneHistory();
        history.replace({ screen: 'support.tickets', url: 'support.tickets', parameters: {} });
        const model = { structure: index, navigation };
        const { container } = render(<SceneNavigationHost screens={screensOf(structure)} initialScreen='support.tickets' registry={registry} history={history} navigationModel={model}
            frame={content => <><NavigationRegionView region={NavigationRegionKind.Sidebar} />{content}</>} />);
        container.querySelector('li[data-scene-nav-item="tickets"]')!.getAttribute('data-active')!.should.equal('true');
    });
});
