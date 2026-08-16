// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Contribution } from '@cratis/scene.model';
import { NavigationEntry, navigationContributionPoint, navigationElement } from '@cratis/scene.blueprint.default';

/**
 * The navigation for this blueprint's gallery, declared once.
 *
 * One list, two consumers: the sidebar menu renders it as `menuItem` elements, and the same elements go to
 * the `Navigation` contribution point where the default blueprint's aggregation turns them back into
 * navigation items. Maintaining a menu *and* a separate navigation declaration would mean two lists that
 * agree right up until someone adds a screen to one of them.
 *
 * `navigationElement` and the contribution point name are the default blueprint's, not this package's.
 * Reimplementing them here would produce a menu that looked identical and contributed to a contribution
 * point nothing reads - which is the exact failure mode a blueprint-on-blueprint dependency exists to
 * avoid.
 */
export const componentsNavigationEntries: NavigationEntry[] = [
    { label: 'Dashboard', targetScreen: 'DashboardPage', icon: 'pi pi-chart-bar', group: 'Billing', order: 10 },
    { label: 'Invoices', targetScreen: 'DataListPage', icon: 'pi pi-list', group: 'Billing', order: 20 },
    { label: 'In flight', targetScreen: 'ObservableDataListPage', icon: 'pi pi-bolt', group: 'Billing', order: 30 },
    { label: 'Invoices and detail', targetScreen: 'DataListWithDetailPage', icon: 'pi pi-window-maximize', group: 'Billing', order: 40 },
    { label: 'Master and detail', targetScreen: 'MasterDetailPage', icon: 'pi pi-table', group: 'Billing', order: 50 },
    { label: 'Register an invoice', targetScreen: 'CommandFormPage', icon: 'pi pi-plus-circle', group: 'Billing', order: 60 },
    { label: 'Event type schema', targetScreen: 'SchemaEditorPage', icon: 'pi pi-sitemap', group: 'Inspect', order: 10 },
    { label: 'Invoice document', targetScreen: 'ObjectEditorPage', icon: 'pi pi-file-edit', group: 'Inspect', order: 20 },
    { label: 'Billing module', targetScreen: 'DataModulePage', icon: 'pi pi-th-large', group: 'Nesting', order: 10 },
    { label: 'Adjustments feature', targetScreen: 'DataFeatureSection', icon: 'pi pi-folder', group: 'Nesting', order: 20 },
    { label: 'Record an adjustment', targetScreen: 'CommandSliceSection', icon: 'pi pi-pencil', group: 'Nesting', order: 30 },
];

/**
 * The navigation as contributions to the `Navigation` contribution point.
 *
 * A screen carries these in its `contributions`, and anything bound to the contribution point recomputes
 * from whatever is currently in scope - so a screen that contributes an extra entry gets it into the
 * navigation without the navigation knowing that screen exists.
 */
export const componentsNavigationContributions: Contribution[] = componentsNavigationEntries.map(entry => ({
    contributionPointName: navigationContributionPoint,
    content: navigationElement(entry),
    order: entry.order,
}));

/** The navigation entries of one group, in order. */
export function entriesInGroup(group: string): NavigationEntry[] {
    return componentsNavigationEntries.filter(entry => entry.group === group).sort((first, second) => first.order - second.order);
}

/** Every group named by the navigation, in first-declared order. */
export const componentsNavigationGroups: string[] = [...new Set(componentsNavigationEntries.map(entry => entry.group))];

/** The section a screen belongs to, for the first entry of its breadcrumb trail. */
export function groupOfScreen(screenName: string): string | undefined {
    return componentsNavigationEntries.find(entry => entry.targetScreen === screenName)?.group;
}

/** The navigation label of a screen, for the last entry of its breadcrumb trail. */
export function labelOfScreen(screenName: string): string | undefined {
    return componentsNavigationEntries.find(entry => entry.targetScreen === screenName)?.label;
}
