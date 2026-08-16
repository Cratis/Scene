// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { ComponentName as DefaultComponentName, SlotName, defaultBlueprintThemes, externalComponent } from '@cratis/scene.blueprint.default';
import { componentsNavigationGroups, entriesInGroup, groupOfScreen, labelOfScreen } from './navigation';

/**
 * The application-shell chrome every gallery screen in this package shares.
 *
 * Every element here names a component the **default blueprint** declares - `topbar`, `sidebar`, `menu`,
 * `breadcrumb`, `footer`, `configPanel`, `logo`, `userMenu` - and every slot is one of that blueprint's
 * `SlotName`s. That is this package's dependency on it made concrete rather than merely declared: this
 * blueprint contributes Arc-bound *pages*, and borrows the shell those pages live in.
 *
 * A blueprint that shipped its own topbar and its own sidebar would be a rival to the default one rather
 * than a layer on it, and an application would have to choose. Since a profile activates one blueprint's
 * layouts and both blueprints' templates, layering is what makes the two usable together at all.
 */

/** The brand mark, shared by the topbar and the sidebar header. */
function logo(id: string): SceneElement {
    return externalComponent(id, DefaultComponentName.Logo, { label: 'Contoso Billing', initials: 'CB', targetScreen: 'DashboardPage' });
}

/** One menu section per navigation group, each holding that group's entries. */
function menuSections(activeScreen: string): SceneElement[] {
    return componentsNavigationGroups.map(group =>
        externalComponent(
            `menu-${group.toLowerCase()}`,
            DefaultComponentName.Menu,
            { title: group, label: group },
            { items: entriesInGroup(group).map(entry => navigationItem(entry.targetScreen, entry.label, entry.icon, entry.order, group, activeScreen)) },
        ),
    );
}

function navigationItem(targetScreen: string, label: string, icon: string, order: number, group: string, activeScreen: string): SceneElement {
    return externalComponent(`nav-${targetScreen}`, DefaultComponentName.MenuItem, {
        label,
        targetScreen,
        routeParameterBindings: {},
        order,
        group,
        icon,
        isActive: targetScreen === activeScreen,
    });
}

/** The configurator, offering the themes the default blueprint ships - this package ships none of its own. */
function configPanel(): SceneElement {
    return externalComponent(DefaultComponentName.ConfigPanel, DefaultComponentName.ConfigPanel, {
        title: 'Settings',
        themes: defaultBlueprintThemes.map(theme => ({ name: theme.name, label: theme.name, isDark: theme.isDark ?? false })),
    });
}

/**
 * The trail above a screen's content, derived from the navigation rather than declared a second time.
 *
 * A hand-written table of breadcrumbs per screen is a second statement of where each screen sits, and the
 * two drift the first time a screen is renamed. The navigation already knows the group and the label, so
 * the trail follows from it.
 */
function breadcrumbEntries(activeScreen: string): { label: string; targetScreen?: string }[] {
    const group = groupOfScreen(activeScreen);
    const label = labelOfScreen(activeScreen) ?? activeScreen;
    return group === undefined ? [{ label }] : [{ label: group, targetScreen: 'DashboardPage' }, { label }];
}

/**
 * The application shell's slot content for one screen.
 *
 * Only the breadcrumb and which menu entry is marked active differ from screen to screen - everything else
 * is identical, which is what chrome is for.
 *
 * @param activeScreen The screen being rendered, so its menu entry is marked current and its trail is built.
 * @returns Slot content keyed by the {@link SlotName}s the default blueprint's `AppShell` layout declares.
 */
export function componentsApplicationChrome(activeScreen: string): Record<string, SceneElement[]> {
    return {
        [SlotName.Topbar]: [
            externalComponent(
                'topbar',
                DefaultComponentName.Topbar,
                {},
                {
                    logo: [logo('topbar-logo')],
                    end: [
                        externalComponent('topbar-user', DefaultComponentName.UserMenu, {
                            name: 'Amelia Nyquist',
                            role: 'Billing owner',
                            initials: 'AN',
                            items: [{ label: 'Invoice document', icon: 'pi pi-file-edit', targetScreen: 'ObjectEditorPage' }],
                        }),
                    ],
                },
            ),
        ],
        [SlotName.Sidebar]: [externalComponent('sidebar', DefaultComponentName.Sidebar, { title: 'Contoso Billing' }, { logo: [logo('sidebar-logo')] })],
        [SlotName.Menu]: menuSections(activeScreen),
        [SlotName.Breadcrumb]: [
            externalComponent('breadcrumb', DefaultComponentName.Breadcrumb, { homeTargetScreen: 'DashboardPage', items: breadcrumbEntries(activeScreen) }),
        ],
        [SlotName.Footer]: [externalComponent('footer', DefaultComponentName.Footer, { text: '© Contoso · Arc-bound pages from Cratis Scene' })],
        [SlotName.ConfigPanel]: [configPanel()],
    };
}
