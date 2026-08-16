// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { ComponentName } from '../ComponentName';
import { SlotName } from '../layouts';
import { defaultBlueprintThemes } from '../themes';
import { externalComponent } from './elements';
import { entriesInGroup, navigationElement, navigationGroups } from './navigation';

/**
 * The chrome every screen in the application shell shares: the topbar, the sidebar, the menu, the footer
 * and the configurator.
 *
 * It is built once, per screen, rather than repeated in twenty templates. A screen template describes what
 * is *different* about a screen; if it also had to describe the topbar, then adding an item to the menu
 * would mean editing twenty files, and nineteen of them would eventually be missed.
 */

/** The brand mark, shared by the topbar and the sidebar header. */
function logo(id: string): SceneElement {
    return externalComponent(id, ComponentName.Logo, { label: 'Contoso', initials: 'C', targetScreen: 'Dashboard' });
}

/** One menu section per navigation group, each holding that group's entries. */
function menuSections(activeScreen: string): SceneElement[] {
    return navigationGroups.map(group =>
        externalComponent(
            `menu-${group.toLowerCase()}`,
            ComponentName.Menu,
            { title: group, label: group },
            { items: entriesInGroup(group).map(entry => navigationElement(entry, activeScreen)) },
        ),
    );
}

/** The configurator, offering the themes this blueprint ships. */
function configPanel(): SceneElement {
    return externalComponent(ComponentName.ConfigPanel, ComponentName.ConfigPanel, {
        title: 'Settings',
        themes: defaultBlueprintThemes.map(theme => ({ name: theme.name, label: theme.name, isDark: theme.isDark ?? false })),
    });
}

/** One trail entry: a label, and the screen it goes back to. */
export interface BreadcrumbEntry {
    /** What the entry is called. */
    label: string;

    /** The screen it navigates back to, or undefined for the current page. */
    targetScreen?: string;
}

/**
 * The application shell's slot content for one screen.
 *
 * Only the breadcrumb and which menu entry is marked active differ from screen to screen - everything else
 * is identical, which is the point of chrome.
 *
 * @param activeScreen The screen being rendered, so its menu entry is marked current.
 * @param breadcrumb The trail above the content.
 * @returns Slot content keyed by the {@link SlotName}s the `AppShell` layout declares.
 */
export function applicationChrome(activeScreen: string, breadcrumb: BreadcrumbEntry[]): Record<string, SceneElement[]> {
    return {
        [SlotName.Topbar]: [
            externalComponent(
                'topbar',
                ComponentName.Topbar,
                {},
                {
                    logo: [logo('topbar-logo')],
                    end: [
                        externalComponent('topbar-user', ComponentName.UserMenu, {
                            name: 'Amelia Nyquist',
                            role: 'Owner',
                            initials: 'AN',
                            items: [
                                { label: 'Your profile', icon: 'pi pi-user', targetScreen: 'ProfileSettings' },
                                { label: 'Help', icon: 'pi pi-question-circle', targetScreen: 'Help' },
                                { label: 'Lock', icon: 'pi pi-lock', targetScreen: 'LockScreen' },
                            ],
                        }),
                    ],
                },
            ),
        ],
        [SlotName.Sidebar]: [externalComponent('sidebar', ComponentName.Sidebar, { title: 'Contoso' }, { logo: [logo('sidebar-logo')] })],
        [SlotName.Menu]: menuSections(activeScreen),
        [SlotName.Breadcrumb]: [
            externalComponent('breadcrumb', ComponentName.Breadcrumb, {
                homeTargetScreen: 'Dashboard',
                items: breadcrumb,
            }),
        ],
        [SlotName.Footer]: [externalComponent('footer', ComponentName.Footer, { text: '© Contoso · Built with Cratis Scene' })],
        [SlotName.ConfigPanel]: [configPanel()],
    };
}

/**
 * The full-page shell's slot content: the configurator and nothing else.
 *
 * A sign-in screen has no navigation to render, but it does have to honor the chosen theme - it is very
 * often the first page anyone sees, and arriving at a light sign-in page before a dark application is a
 * jarring way to start.
 */
export function fullPageChrome(): Record<string, SceneElement[]> {
    return { [SlotName.ConfigPanel]: [configPanel()] };
}
