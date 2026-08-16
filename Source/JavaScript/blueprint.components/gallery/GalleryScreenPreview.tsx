// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { ComponentRegistry, SceneElementView, coreComponents } from '@cratis/scene.react';
import { cratisComponents } from '@cratis/scene.components';
import { LayoutConfigProvider, LayoutConfigState, LayoutThemeProvider, composeScreenElement, defaultBlueprintComponents, defaultBlueprintThemes, resolveElementComponentNames } from '@cratis/scene.blueprint.default';
import { componentsBlueprintComponents } from '../componentsBlueprintComponents';
import { componentsBlueprintCatalog, componentsBlueprintProfile } from './previewProfile';
import { componentsGalleryScreen } from './screens';

/**
 * The registry a preview resolves against: `core`, `Cratis.Components`, the default blueprint, and this one.
 *
 * Merged by hand rather than through `mergePackageRegistries`, because reaching for this blueprint's own
 * *bundle* here would be circular - the bundle is assembled from the gallery this file belongs to. Registry
 * keys carry their package name, so merge order cannot cause a collision either way.
 *
 * Four of the profile's five packages are present. `PrimeReact` is not, which is why a `column` inside a
 * table comes out unresolved - and it never reaches the DOM, because the table it belongs to is a
 * placeholder until a host registers its query.
 */
export const componentsPreviewRegistry: ComponentRegistry = {
    ...coreComponents,
    ...cratisComponents,
    ...defaultBlueprintComponents,
    ...componentsBlueprintComponents,
};

export interface GalleryScreenPreviewProps {
    /** The name of the gallery screen to boot. */
    screenName: string;

    /** Configuration to start from - a story pinning a layout mode, or a host restoring a session. */
    initialConfig?: Partial<LayoutConfigState>;

    /** The component registry to render against. Defaults to {@link componentsPreviewRegistry}. */
    registry?: ComponentRegistry;
}

/**
 * Boots one gallery screen through the real engine.
 *
 * Nothing here is a preview-only path: the screen is a real `Screen`, its element tree is resolved by the
 * real `resolveComponentName`, and it is rendered by the real `SceneElementView` against the real registry.
 * That is the point of shipping a gallery at all - a mockup proves someone can draw an invoice list, and
 * this proves the blueprint renders one.
 *
 * `LayoutConfigProvider` and `LayoutThemeProvider` are the default blueprint's, because the shell being
 * previewed is the default blueprint's shell. This package provides Arc-bound pages to put inside it, and
 * previewing them without the thing they were designed to sit in would prove the wrong thing.
 */
export function GalleryScreenPreview({ screenName, initialConfig, registry = componentsPreviewRegistry }: GalleryScreenPreviewProps) {
    const element = useMemo(() => {
        const screen = componentsGalleryScreen(screenName);
        if (!screen) {
            throw new Error(`The gallery has no screen named '${screenName}'.`);
        }

        return resolveElementComponentNames(composeScreenElement(screen), componentsBlueprintProfile, componentsBlueprintCatalog);
    }, [screenName]);

    return (
        <LayoutConfigProvider initialConfig={initialConfig} storage={null}>
            <LayoutThemeProvider themes={defaultBlueprintThemes}>
                <SceneElementView element={element} registry={registry} resolveBinding={() => undefined} />
            </LayoutThemeProvider>
        </LayoutConfigProvider>
    );
}
