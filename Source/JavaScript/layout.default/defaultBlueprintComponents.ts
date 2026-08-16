// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentRegistry, componentRegistryKey } from '@cratis/scene.react';
import { ComponentName } from './ComponentName';
import { defaultBlueprintName } from './packageName';
import {
    AppShell,
    Breadcrumb,
    ConfigPanel,
    Footer,
    FullPageShell,
    LayoutModeSwitcher,
    Logo,
    Mask,
    Menu,
    MenuItem,
    PageHeader,
    RightPanel,
    Sidebar,
    ThemeSwitcher,
    Topbar,
    UserMenu,
} from './shell';

/**
 * The components this package registers, keyed the way the renderer looks them up.
 *
 * Every key is built with `componentRegistryKey` rather than written out, because the separator between
 * package and component name is the registry's own business - it is deliberately not the `.` a screen uses
 * to qualify a name, so that a package name containing dots stays unambiguous. Building a key by hand is
 * how a component ends up registered under something no lookup will ever produce.
 */
export const defaultBlueprintComponents: ComponentRegistry = {
    [componentRegistryKey(defaultBlueprintName, ComponentName.AppShell)]: AppShell,
    [componentRegistryKey(defaultBlueprintName, ComponentName.FullPageShell)]: FullPageShell,
    [componentRegistryKey(defaultBlueprintName, ComponentName.Topbar)]: Topbar,
    [componentRegistryKey(defaultBlueprintName, ComponentName.Sidebar)]: Sidebar,
    [componentRegistryKey(defaultBlueprintName, ComponentName.Menu)]: Menu,
    [componentRegistryKey(defaultBlueprintName, ComponentName.MenuItem)]: MenuItem,
    [componentRegistryKey(defaultBlueprintName, ComponentName.Breadcrumb)]: Breadcrumb,
    [componentRegistryKey(defaultBlueprintName, ComponentName.Footer)]: Footer,
    [componentRegistryKey(defaultBlueprintName, ComponentName.RightPanel)]: RightPanel,
    [componentRegistryKey(defaultBlueprintName, ComponentName.ConfigPanel)]: ConfigPanel,
    [componentRegistryKey(defaultBlueprintName, ComponentName.PageHeader)]: PageHeader,
    [componentRegistryKey(defaultBlueprintName, ComponentName.Mask)]: Mask,
    [componentRegistryKey(defaultBlueprintName, ComponentName.Logo)]: Logo,
    [componentRegistryKey(defaultBlueprintName, ComponentName.UserMenu)]: UserMenu,
    [componentRegistryKey(defaultBlueprintName, ComponentName.ThemeSwitcher)]: ThemeSwitcher,
    [componentRegistryKey(defaultBlueprintName, ComponentName.LayoutModeSwitcher)]: LayoutModeSwitcher,
};
