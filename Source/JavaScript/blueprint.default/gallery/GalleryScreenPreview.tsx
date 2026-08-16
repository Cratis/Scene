// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { Theme } from '@cratis/scene.model';
import { ComponentRegistry, SceneElementView, coreComponents } from '@cratis/scene.react';
import { LayoutConfigProvider, LayoutConfigState } from '../configuration';
import { defaultBlueprintComponents } from '../defaultBlueprintComponents';
import { LayoutThemeProvider, defaultBlueprintThemes } from '../themes';
import { composeScreenElement } from './composeScreen';
import { galleryComponentCatalog, galleryPreviewProfile } from './previewProfile';
import { resolveElementComponentNames } from './resolveElementNames';
import { galleryScreen } from './screens';

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
}

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
export function GalleryScreenPreview({ screenName, initialConfig, themes = defaultBlueprintThemes, registry = galleryPreviewRegistry }: GalleryScreenPreviewProps) {
    const element = useMemo(() => {
        const screen = galleryScreen(screenName);
        if (!screen) {
            throw new Error(`The gallery has no screen named '${screenName}'.`);
        }

        return resolveElementComponentNames(composeScreenElement(screen), galleryPreviewProfile, galleryComponentCatalog);
    }, [screenName]);

    return (
        <LayoutConfigProvider initialConfig={initialConfig} storage={null}>
            <LayoutThemeProvider themes={themes}>
                <SceneElementView element={element} registry={registry} resolveBinding={() => undefined} />
            </LayoutThemeProvider>
        </LayoutConfigProvider>
    );
}
