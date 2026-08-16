// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ContentControl, ExternalComponent, ItemsControl, Panel, SceneElement, UiProfile } from '@cratis/scene.model';
import { PackageCatalog, isContentControl, isExternalComponent, isItemsControl, isPanel, resolveComponentName } from '@cratis/scene.engine';
import { componentRegistryKey } from '@cratis/scene.react';

/**
 * Rewrites an element tree's bare component names into the keys the React registry is keyed by.
 *
 * The renderer looks a component up by `element.componentName` against a registry keyed by
 * `componentRegistryKey(package, name)`, so something has to resolve bare names against the active profile
 * first. Wiring that into the renderer proper is Stage's job and does not exist yet; this is the small
 * local version that lets the gallery boot through the *real* engine and the *real* registry today rather
 * than waiting for it.
 *
 * A name nothing declares is left exactly as written. That is deliberate: the renderer then falls back to
 * `UnresolvedComponent` and shows a dashed red box naming the component, which is far more useful than a
 * throw from inside a tree walk.
 *
 * @param element The tree to rewrite.
 * @param profile The profile whose package priority decides which package wins a bare name.
 * @param catalog Each active package's declared component names.
 * @returns A new tree; the original is untouched.
 */
export function resolveElementComponentNames(element: SceneElement, profile: UiProfile, catalog: PackageCatalog): SceneElement {
    if (isExternalComponent(element)) {
        const resolution = resolveComponentName(element.componentName, profile, catalog);
        const resolved: ExternalComponent = {
            ...element,
            componentName: resolution ? componentRegistryKey(resolution.package, resolution.name) : element.componentName,
            slots: Object.fromEntries(
                Object.entries(element.slots).map(([name, children]) => [name, children.map(child => resolveElementComponentNames(child, profile, catalog))]),
            ),
        };
        return resolved;
    }

    if (isContentControl(element)) {
        const contentControl: ContentControl = { ...element, content: resolveElementComponentNames(element.content, profile, catalog) };
        return contentControl;
    }

    if (isItemsControl(element)) {
        const itemsControl: ItemsControl = { ...element, itemTemplate: resolveElementComponentNames(element.itemTemplate, profile, catalog) };
        return itemsControl;
    }

    if (isPanel(element)) {
        const panel: Panel = { ...element, children: element.children.map(child => resolveElementComponentNames(child, profile, catalog)) };
        return panel;
    }

    return element;
}
