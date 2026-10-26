// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { ExternalComponent, SampleDataPack, SceneElement, Theme } from '@cratis/scene.model';
import { ComponentRegistry, SceneElementView, coreComponents } from '@cratis/scene.react';
import { LayoutConfigProvider, LayoutConfigState } from '../configuration';
import { ComponentName } from '../ComponentName';
import { defaultBlueprintComponents } from '../defaultBlueprintComponents';
import { ComponentState, foundationSamples } from '../foundation';
import { defaultBlueprintName } from '../packageName';
import { LayoutThemeProvider, defaultBlueprintThemes } from '../themes';
import { composeScreenElement } from './composeScreen';
import { galleryComponentCatalog, previewProfileFor } from './previewProfile';
import { resolveElementComponentNames } from './resolveElementNames';
import { galleryScreen } from './screens';
import { TemplatePreviewState } from './TemplatePreviewState';
import { applyTemplatePreviewState } from './applyTemplatePreviewState';

/**
 * The registry a preview resolves against when a host does not supply one: `core` plus this blueprint.
 *
 * Merged by hand rather than through `mergePackageRegistries`, because reaching for this blueprint's
 * *bundle* here would be circular - the bundle is assembled from the gallery this file belongs to. Registry
 * keys carry their package name, so merge order cannot cause a collision either way.
 */
export const galleryPreviewRegistry: ComponentRegistry = { ...coreComponents, ...defaultBlueprintComponents };

export interface GalleryScreenPreviewProps {
    /** The name of the gallery screen to boot. */
    screenName: string;

    /** Configuration to start from - a story pinning a mode, or a host restoring a session. */
    initialConfig?: Partial<LayoutConfigState>;

    /** The themes the configurator may switch between. Defaults to the two this blueprint ships. */
    themes?: Theme[];

    /** The component registry to render against. Defaults to `core` plus this blueprint's own components. */
    registry?: ComponentRegistry;

    /** The data state to show. Defaults to the seeded, populated records. */
    state?: TemplatePreviewState;

    /**
     * The sample-data pack that stands in for the queries the templates bind to: each set's `shape` is a query name and its `rows` that query's result.
     * Templates carry no rows of their own - they declare where the data comes from (spec SD1) - so a preview of a foundation template needs one.
     */
    pack?: SampleDataPack;

    /**
     * A standard state (spec Part B 1.4) to force on every foundation component that owns the five states: loading, error, no-permission or partial.
     * This is how a designer inspects each one on a real template - it only sets the `state` property the components already read, so there is no
     * second code path. `error`, `permissionSubject` and `failedRegions` give the state its message.
     */
    forceState?: ForcedComponentState;
}

/** The standard states a preview can force on a template's components. */
export interface ForcedComponentState {
    state: ComponentState;
    error?: string;
    permissionSubject?: string;
    failedRegions?: string[];
}

/** Components that are chrome or controls rather than data-showing regions, and so do not own the five states. */
const withoutStates = new Set<string>([
    ComponentName.EmptyState, ComponentName.TrendChip, ComponentName.StatusChip, ComponentName.BulkBar, ComponentName.GlobalSearch, ComponentName.NotificationsButton,
]);

/** Sets the forced state on every region that owns the five states, leaving chrome and controls as they are. */
export function forceComponentState(element: SceneElement, forced: ForcedComponentState): SceneElement {
    const external = element as Partial<ExternalComponent>;
    const children = (element as { children?: SceneElement[] }).children;
    const slots = external.slots ? Object.fromEntries(Object.entries(external.slots).map(([slot, inner]) => [slot, inner.map(child => forceComponentState(child, forced))])) : undefined;
    const bare = typeof external.componentName === 'string' ? external.componentName.substring(external.componentName.lastIndexOf(':') + 1) : undefined;
    const owns = bare !== undefined && external.componentName!.includes(defaultBlueprintName) && (bare in foundationSamples) && foundationSamples[bare].stateful && !withoutStates.has(bare);

    return {
        ...element,
        ...(owns ? { properties: { ...external.properties, ...forced } } : {}),
        ...(slots ? { slots } : {}),
        ...(children ? { children: children.map(child => forceComponentState(child, forced)) } : {}),
    } as SceneElement;
}

/**
 * A pack as the query results the templates bind to: one entry for each set, keyed by the set's shape name.
 *
 * The state is a property of the *data*, not of the template: Empty answers every query with no rows; Loading and Error withhold the answer, which is
 * what a query that has not come back or has failed looks like to a component, so each shows its own skeleton or error exactly as it will in an application.
 * The elements themselves are untouched, which is why the same template previews in every state with no per-template code.
 */
export const queryResultsOf = (pack: SampleDataPack | undefined, state: TemplatePreviewState = TemplatePreviewState.Populated): Record<string, unknown> | undefined => {
    if (pack === undefined) return undefined;
    if (state === TemplatePreviewState.Empty) return Object.fromEntries(pack.sets.map(set => [set.shape, []]));
    return Object.fromEntries(pack.sets.map(set => [set.shape, set.rows]));
};

/**
 * Boots one gallery screen through the real engine.
 *
 * Nothing here is a preview-only path: the screen is a real {@link Screen}, its element tree is resolved by
 * the real `resolveComponentName`, and it is rendered by the real `SceneElementView` against the real
 * registry. That is the point of shipping a gallery at all - a mockup proves that someone can draw a
 * dashboard, and this proves the blueprint renders one.
 *
 * Component names belonging to packages the host has not loaded resolve but find no implementation, and
 * come out as `UnresolvedComponent`'s dashed red box naming what is missing. That is the designed outcome:
 * a preview of a blueprint against half a profile should look visibly incomplete rather than quietly
 * wrong.
 */
export function GalleryScreenPreview({ screenName, initialConfig, themes = defaultBlueprintThemes, registry = galleryPreviewRegistry, state = TemplatePreviewState.Populated, pack, forceState }: GalleryScreenPreviewProps) {
    const element = useMemo(() => {
        const screen = galleryScreen(screenName);
        if (!screen) {
            throw new Error(`The gallery has no screen named '${screenName}'.`);
        }

        const resolved = applyTemplatePreviewState(resolveElementComponentNames(composeScreenElement(screen), previewProfileFor(registry), galleryComponentCatalog), state);
        return forceState ? forceComponentState(resolved, forceState) : resolved;
    }, [screenName, state, forceState, registry]);

    return (
        <LayoutConfigProvider initialConfig={initialConfig} storage={null}>
            <LayoutThemeProvider themes={themes}>
                <SceneElementView element={element} registry={registry} resolveBinding={() => undefined} queryResults={queryResultsOf(pack, state)} />
            </LayoutThemeProvider>
        </LayoutConfigProvider>
    );
}
