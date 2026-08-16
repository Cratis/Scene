// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Contribution, SceneElement } from '@cratis/scene.model';
import { ComponentName } from '../ComponentName';
import { NavigationEntry } from './NavigationEntry';
import { externalComponent } from './elements';

/** The contribution point the built-in navigation aggregation reads. */
export const navigationContributionPoint = 'Navigation';

/**
 * The gallery's navigation, declared once.
 *
 * One list, two consumers: the sidebar menu renders it as `menuItem` elements, and the same elements go to
 * the `Navigation` contribution point where `aggregateContributions` + `extractNavigationItem` turn them
 * back into navigation items. A blueprint that maintained a menu *and* a separate navigation declaration
 * would have two lists that agree right up until someone adds a screen to one of them.
 */
export const navigationEntries: NavigationEntry[] = [
    { label: 'Dashboard', targetScreen: 'Dashboard', icon: 'pi pi-home', group: 'Workspace', order: 10 },
    { label: 'Products', targetScreen: 'CrudList', icon: 'pi pi-box', group: 'Workspace', order: 20 },
    { label: 'Product detail', targetScreen: 'DetailView', icon: 'pi pi-file', group: 'Workspace', order: 30 },
    { label: 'New product', targetScreen: 'FormPage', icon: 'pi pi-plus-circle', group: 'Workspace', order: 40 },
    { label: 'Invoices', targetScreen: 'Invoice', icon: 'pi pi-receipt', group: 'Workspace', order: 50 },
    { label: 'Nothing yet', targetScreen: 'Empty', icon: 'pi pi-inbox', group: 'Workspace', order: 60 },
    { label: 'Users', targetScreen: 'UserManagement', icon: 'pi pi-users', group: 'Administration', order: 10 },
    { label: 'Your profile', targetScreen: 'ProfileSettings', icon: 'pi pi-user', group: 'Administration', order: 20 },
    { label: 'Documentation', targetScreen: 'Documentation', icon: 'pi pi-book', group: 'Support', order: 10 },
    { label: 'Help', targetScreen: 'Help', icon: 'pi pi-question-circle', group: 'Support', order: 20 },
];

/**
 * The element one navigation entry becomes.
 *
 * `routeParameterBindings` is present and empty rather than omitted, because that is what
 * `extractNavigationItem` expects to read - and an omitted bag and an empty one are the same thing right
 * up until something iterates it.
 */
export function navigationElement(entry: NavigationEntry, activeScreen?: string): SceneElement {
    return externalComponent(`nav-${entry.targetScreen}`, ComponentName.MenuItem, {
        label: entry.label,
        targetScreen: entry.targetScreen,
        routeParameterBindings: {},
        order: entry.order,
        group: entry.group,
        icon: entry.icon,
        isActive: entry.targetScreen === activeScreen,
    });
}

/**
 * The navigation as contributions to the `Navigation` contribution point.
 *
 * A screen carries these in its `contributions`, and anything bound to the contribution point recomputes
 * from whatever is currently in scope - so a screen that contributes an extra entry gets it in the
 * navigation without the navigation knowing that screen exists.
 */
export const navigationContributions: Contribution[] = navigationEntries.map(entry => ({
    contributionPointName: navigationContributionPoint,
    content: navigationElement(entry),
    order: entry.order,
}));

/** The navigation entries of one group, in order. */
export function entriesInGroup(group: string): NavigationEntry[] {
    return navigationEntries.filter(entry => entry.group === group).sort((first, second) => first.order - second.order);
}

/** Every group named by the navigation, in first-declared order. */
export const navigationGroups: string[] = [...new Set(navigationEntries.map(entry => entry.group))];
