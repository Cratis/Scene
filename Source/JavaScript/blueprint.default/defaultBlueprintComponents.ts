// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentRegistry, componentRegistryKey } from '@cratis/scene.react';
import { ComponentName } from './ComponentName';
import { defaultBlueprintName } from './packageName';
import { BulkBar, DataList, FormScreenBody, GlobalSearch, KanbanBoard, NotificationsButton, SubNavigation, TabSet, WizardProgress, ActivityFeed, ApprovalChainStepper, AvatarStack, ChartWrapper, ChecklistSection, ColumnChooser, FileUploader, EmptyState, FilterBuilder, OrgTree, PermissionMatrix, SavedViewsMenu, StatCard, StatusChip, TrendChip } from './foundation';
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
    [componentRegistryKey(defaultBlueprintName, ComponentName.EmptyState)]: EmptyState,
    [componentRegistryKey(defaultBlueprintName, ComponentName.StatCard)]: StatCard,
    [componentRegistryKey(defaultBlueprintName, ComponentName.TrendChip)]: TrendChip,
    [componentRegistryKey(defaultBlueprintName, ComponentName.StatusChip)]: StatusChip,
    [componentRegistryKey(defaultBlueprintName, ComponentName.ChartWrapper)]: ChartWrapper,
    [componentRegistryKey(defaultBlueprintName, ComponentName.FilterBuilder)]: FilterBuilder,
    [componentRegistryKey(defaultBlueprintName, ComponentName.ColumnChooser)]: ColumnChooser,
    [componentRegistryKey(defaultBlueprintName, ComponentName.SavedViewsMenu)]: SavedViewsMenu,
    [componentRegistryKey(defaultBlueprintName, ComponentName.ChecklistSection)]: ChecklistSection,
    [componentRegistryKey(defaultBlueprintName, ComponentName.ActivityFeed)]: ActivityFeed,
    [componentRegistryKey(defaultBlueprintName, ComponentName.AvatarStack)]: AvatarStack,
    [componentRegistryKey(defaultBlueprintName, ComponentName.FileUploader)]: FileUploader,
    [componentRegistryKey(defaultBlueprintName, ComponentName.ApprovalChainStepper)]: ApprovalChainStepper,
    [componentRegistryKey(defaultBlueprintName, ComponentName.OrgTree)]: OrgTree,
    [componentRegistryKey(defaultBlueprintName, ComponentName.PermissionMatrix)]: PermissionMatrix,
    [componentRegistryKey(defaultBlueprintName, ComponentName.DataList)]: DataList,
    [componentRegistryKey(defaultBlueprintName, ComponentName.TabSet)]: TabSet,
    [componentRegistryKey(defaultBlueprintName, ComponentName.SubNavigation)]: SubNavigation,
    [componentRegistryKey(defaultBlueprintName, ComponentName.BulkBar)]: BulkBar,
    [componentRegistryKey(defaultBlueprintName, ComponentName.GlobalSearch)]: GlobalSearch,
    [componentRegistryKey(defaultBlueprintName, ComponentName.NotificationsButton)]: NotificationsButton,
    [componentRegistryKey(defaultBlueprintName, ComponentName.KanbanBoard)]: KanbanBoard,
    [componentRegistryKey(defaultBlueprintName, ComponentName.WizardProgress)]: WizardProgress,
    [componentRegistryKey(defaultBlueprintName, ComponentName.FormScreenBody)]: FormScreenBody,
};
