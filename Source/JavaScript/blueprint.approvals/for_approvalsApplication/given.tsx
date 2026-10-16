// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ReactNode, useMemo } from 'react';
import axe from 'axe-core';
import { PrimeReactProvider } from '@primereact/core';
import { DestinationKind, ExternalComponent, NotificationLevel, SampleDataPack, SceneElement } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { InteractionScope, SceneNavigationContextValue, corePackage, createBrowserDispatcher, mergePackageRegistries } from '@cratis/scene.react';
import { ApplicationHost, ComponentState, ScenePreviewHost, ScenePreviewHostProps, createPreviewSampleData, defaultBlueprint, foundationSamples } from '@cratis/scene.blueprint.default';
import { approvalsApplication, approvalsComposition, approvalsNavigation, approvalsStructure } from '../index';

/** The package root. */
export const packageRoot = join(import.meta.dirname, '..');

const read = (id: string): SampleDataPack => JSON.parse(readFileSync(join(packageRoot, 'sampleData', `${id}.json`), 'utf-8'));

/** The two sample-data packs the blueprint ships, read from where it ships them. */
export const english = read('approvals-general');
export const german = read('approvals-nordic');
export const packs = [english, german];

/** The registry an application of the blueprint renders with: core and the foundation set - the blueprint brings no component of its own. */
export const registry = mergePackageRegistries([corePackage, defaultBlueprint]);

/** The accessibility rules of WCAG 2.2 A and AA; contrast needs a real page and is audited in Chromium. */
const wcagRules = { runOnly: { type: 'tag' as const, values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } };

/** The accessibility violations axe finds in a rendered container, as readable lines. */
export async function violationsIn(container: HTMLElement): Promise<string[]> {
    return (await axe.run(container, wcagRules)).violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`);
}

/** A standard state to force on every foundation region of a preview. */
export interface ForcedState {
    state: ComponentState;
    error?: string;
    permissionSubject?: string;
    failedRegions?: string[];
}

const withoutStates = new Set(['emptyState', 'trendChip', 'statusChip', 'bulkBar', 'globalSearch', 'notificationsButton']);

/** Sets the forced state on every region that owns the five states, leaving chrome and controls as they are. */
export function forceState(element: SceneElement, forced: ForcedState): SceneElement {
    const external = element as Partial<ExternalComponent>;
    const children = (element as { children?: SceneElement[] }).children;
    const slots = external.slots ? Object.fromEntries(Object.entries(external.slots).map(([slot, inner]) => [slot, inner.map(child => forceState(child, forced))])) : undefined;
    const name = typeof external.componentName === 'string' ? external.componentName : undefined;
    const owns = name !== undefined && name in foundationSamples && foundationSamples[name].stateful && !withoutStates.has(name);
    return {
        ...element,
        ...(owns ? { properties: { ...external.properties, ...forced } } : {}),
        ...(slots ? { slots } : {}),
        ...(children ? { children: children.map(child => forceState(child, forced)) } : {}),
    } as SceneElement;
}

/** The feature of a screen name: `approvals.requests.new` is the `requests.new` feature of the `approvals` module. */
export const featureOf = (screen: string) => screen.split('.').slice(1).join('.');

/** An application of the blueprint previewed from the given screen, with the given pack active. */
export function preview(screen: string, pack: SampleDataPack = english, props: Partial<ScenePreviewHostProps> = {}, children?: ReactNode) {
    return (
        <PrimeReactProvider>
            <ScenePreviewHost document={approvalsApplication(pack.id)} structure={approvalsStructure} navigation={approvalsNavigation} target={{ module: 'approvals', feature: featureOf(screen) }} registry={registry}
                sampleData={{ packs, blueprintDefaultPack: pack.id }} composition={approvalsComposition} {...props}>
                {children}
            </ScenePreviewHost>
        </PrimeReactProvider>
    );
}

/** What an application's interactions reported: the messages a Notify action showed. */
export type Notifications = { level: NotificationLevel; message: string }[];

function Interactions({ navigation, notifications, children }: { navigation: SceneNavigationContextValue; notifications: Notifications; children: ReactNode }) {
    // What Stage's own host does with the same actions: a screen is navigated to, a dialog is opened and closed on the navigation, a notification is shown.
    const dispatcher = useMemo(() => createBrowserDispatcher({
        navigate: screen => navigation.navigate({ screen }),
        openDialog: async dialog => { navigation.navigate({ kind: DestinationKind.Dialog, dialog }); return { isConfirmed: true }; },
        closeDialog: () => navigation.closeDialog(),
        notify: (level, message) => { notifications.push({ level, message }); },
    }), [navigation, notifications]);

    return <InteractionScope dispatcher={dispatcher} context={{ resolve: () => undefined }} attachments={[]}>{children}</InteractionScope>;
}

/**
 * The blueprint as an application that runs its interactions: the host Stage is, in miniature - the real application host, the sample data of a pack
 * for the queries, and a dispatcher that navigates, opens and closes dialogs and notifies. Pressing New lead opens its dialog here as it does in Stage.
 */
export function interactive(screen: string, pack: SampleDataPack = english, notifications: Notifications = []) {
    const application = approvalsApplication(pack.id);
    const samples = createPreviewSampleData(application, { packs, blueprintDefaultPack: pack.id });
    return (
        <PrimeReactProvider>
            <ApplicationHost application={application} composition={approvalsComposition} navigationModel={{ structure: new ApplicationStructureIndex(approvalsStructure), navigation: approvalsNavigation }} registry={registry}
                initialScreen={screen} resolveBinding={samples.resolveBinding} queryResults={samples.queryResults}
                scope={(navigation, children) => <Interactions navigation={navigation} notifications={notifications}>{children}</Interactions>} />
        </PrimeReactProvider>
    );
}

const nothing = () => undefined;

/** jsdom has no layout engine or media queries, so the components that measure themselves are given a size and a media list that never matches, as the foundation's own specifications do. */
export function provideBrowserApis() {
    globalThis.ResizeObserver ??= class { observe = nothing; unobserve = nothing; disconnect = nothing; } as unknown as typeof ResizeObserver;
    window.matchMedia ??= (() => ({ matches: false, addEventListener: nothing, removeEventListener: nothing, addListener: nothing, removeListener: nothing })) as unknown as typeof window.matchMedia;
    HTMLElement.prototype.scrollIntoView ??= nothing;
}
