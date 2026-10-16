// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Layout, Screen, ScreenTemplate } from '@cratis/scene.model';
import { foundationScreenTemplates, laterScreenTemplates, stateScreenTemplates } from '../foundation/templates';
import { LayoutName, appShellLayout, fullPageLayout } from '../layouts';
import { BreadcrumbEntry, applicationChrome, fullPageChrome } from './applicationChrome';
import { nestScreenTemplates, templateContentInLayout } from './composeScreen';
import { authTemplates } from './authTemplates';
import { navigationContributions } from './navigation';
import { nestingChainTemplates } from './nesting';
import { statusTemplates } from './statusTemplates';
import { supportTemplates } from './supportTemplates';
import { workspaceTemplates } from './workspaceTemplates';

/**
 * The screen templates this blueprint provides.
 *
 * Eleven shapes for inside the application shell, ten for the full-page shell, and the three-level nesting
 * chain that demonstrates how `fitsSlot` composes. The list is what the manifest's `screenTemplates` names
 * and what the bundle provides; `validatePackageBundle` proves the two agree.
 */
export const galleryScreenTemplates: ScreenTemplate[] = [
    ...foundationScreenTemplates,
    ...laterScreenTemplates,
    ...stateScreenTemplates,
    ...workspaceTemplates,
    ...supportTemplates,
    ...authTemplates,
    ...statusTemplates,
    ...nestingChainTemplates,
];

/** Which layout each template renders inside - the application shell unless it is one of the chrome-less screens. */
const fullPageTemplateNames = new Set([...authTemplates, ...statusTemplates, ...stateScreenTemplates].map(template => template.name));

/** The trail shown above each application-shell screen. */
const breadcrumbs: Record<string, BreadcrumbEntry[]> = {
    Dashboard: [{ label: 'Dashboard' }],
    CrudList: [{ label: 'Catalog', targetScreen: 'Dashboard' }, { label: 'Products' }],
    MasterDetail: [{ label: 'Sales', targetScreen: 'Dashboard' }, { label: 'Customers' }],
    DetailView: [{ label: 'Catalog', targetScreen: 'Dashboard' }, { label: 'Products', targetScreen: 'CrudList' }, { label: 'Bamboo Watch' }],
    FormPage: [{ label: 'Catalog', targetScreen: 'Dashboard' }, { label: 'Products', targetScreen: 'CrudList' }, { label: 'New product' }],
    Empty: [{ label: 'Catalog', targetScreen: 'Dashboard' }, { label: 'Products' }],
    Documentation: [{ label: 'Support', targetScreen: 'Dashboard' }, { label: 'Documentation' }],
    ProfileSettings: [{ label: 'Administration', targetScreen: 'Dashboard' }, { label: 'Your profile' }],
    UserManagement: [{ label: 'Administration', targetScreen: 'Dashboard' }, { label: 'Users' }],
    Invoice: [{ label: 'Billing', targetScreen: 'Dashboard' }, { label: 'INV-2043' }],
    Help: [{ label: 'Support', targetScreen: 'Dashboard' }, { label: 'Help' }],
    DashboardScreen: [{ label: 'Dashboard' }],
    ListScreen: [{ label: 'Sales', targetScreen: 'DashboardScreen' }, { label: 'Deals' }],
    BoardScreen: [{ label: 'Sales', targetScreen: 'DashboardScreen' }, { label: 'Pipeline' }],
    WorkspaceScreen: [{ label: 'Sales' }],
    MasterDetailScreen: [{ label: 'Sales', targetScreen: 'WorkspaceScreen' }, { label: 'Accounts' }],
    RecordPage: [{ label: 'Sales', targetScreen: 'DashboardScreen' }, { label: 'Accounts', targetScreen: 'ListScreen' }, { label: 'Account' }],
    FormScreen: [{ label: 'Sales', targetScreen: 'DashboardScreen' }, { label: 'Accounts', targetScreen: 'ListScreen' }, { label: 'New account' }],
    WizardScreen: [{ label: 'Sales', targetScreen: 'DashboardScreen' }, { label: 'New account' }],
    CalendarScreen: [{ label: 'People', targetScreen: 'DashboardScreen' }, { label: 'Calendar' }],
    TimelineScreen: [{ label: 'Projects', targetScreen: 'DashboardScreen' }, { label: 'Timeline' }],
    ModuleWorkspace: [{ label: 'Operations' }],
    FeatureSection: [{ label: 'Operations', targetScreen: 'ModuleWorkspace' }, { label: 'Adjustments' }],
    SliceSection: [
        { label: 'Operations', targetScreen: 'ModuleWorkspace' },
        { label: 'Adjustments', targetScreen: 'FeatureSection' },
        { label: 'Record an adjustment' },
    ],
};

/**
 * Builds the {@link Screen} that instantiates one template.
 *
 * A screen is an instance, not a shape: it names the layout it renders in, the template it fills, the
 * content that fills it, and what it contributes elsewhere. Everything structural comes from the template,
 * which is why adding a screen is a handful of lines rather than another copy of the chrome.
 */
function screenFor(template: ScreenTemplate): Screen {
    const isFullPage = fullPageTemplateNames.has(template.name);
    const layout: Layout = isFullPage ? fullPageLayout : appShellLayout;
    const chrome = isFullPage ? fullPageChrome() : applicationChrome(template.name, breadcrumbs[template.name] ?? [{ label: template.displayName ?? template.name }]);
    const placeable = nestScreenTemplates(containmentChainFor(template));

    return {
        name: template.name,
        layout: isFullPage ? LayoutName.FullPage : LayoutName.AppShell,
        screenTemplate: template.name,
        slotContent: mergeSlotContent(chrome, templateContentInLayout(placeable, layout)),
        forms: [],
        contributions: isFullPage ? [] : navigationContributions,
    };
}

/**
 * The chain of templates a screen renders through, outermost first.
 *
 * Almost every template fits the layout's own `content` slot, so its chain is just itself. The three
 * nesting-chain templates are the exception, and the only ones that need the walk - which is the honest
 * version of the story: nesting exists for the applications that need it, and costs nothing for the ones
 * that do not.
 */
function containmentChainFor(template: ScreenTemplate): ScreenTemplate[] {
    const depth = nestingChainTemplates.findIndex(candidate => candidate.name === template.name);
    if (depth >= 0) return nestingChainTemplates.slice(0, depth + 1);

    // A template that fits a container-qualified slot (`WorkspaceScreen.moduleContent`) renders inside that container, which is what the qualifier is for.
    const [container] = (template.fitsSlot ?? '').split('.');
    const outer = container ? foundationScreenTemplates.find(candidate => candidate.name === container) : undefined;
    return outer ? [outer, template] : [template];
}

function mergeSlotContent(chrome: Record<string, Screen['slotContent'][string]>, content: Record<string, Screen['slotContent'][string]>): Screen['slotContent'] {
    const merged: Screen['slotContent'] = { ...chrome };
    for (const [slotName, elements] of Object.entries(content)) {
        merged[slotName] = [...(merged[slotName] ?? []), ...elements];
    }

    return merged;
}

/**
 * The gallery: one screen per template, ready to boot through the real engine.
 *
 * These exist so a preview is a working miniature application rather than a set of pictures - the same
 * `Screen` shape Stage produces, put through the same `Scene.Engine` and `Scene.React`, with no separate
 * preview pipeline and nothing mocked.
 */
export const galleryScreens: Screen[] = galleryScreenTemplates.map(screenFor);

/** One gallery screen by name, for a story or a host that boots a specific one. */
export function galleryScreen(name: string): Screen | undefined {
    return galleryScreens.find(screen => screen.name === name);
}
