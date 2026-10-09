// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { PrimeReactProvider } from '@primereact/core';
import { PackageKind } from '@cratis/scene.model';
import { ComponentRegistry, PackageHostView, RegisteredComponentProps, ScenePackageBundle, corePackage, resolvePackageHost } from '@cratis/scene.react';
import { cratisComponentsPackage } from '@cratis/scene.components';
import { defaultBlueprint, LayoutConfigProvider, LayoutConfigState, LayoutThemeProvider, composeScreenElement, defaultBlueprintThemes, resolveElementComponentNames } from '@cratis/scene.blueprint.default';
import { componentsBlueprintComponents } from '../componentsBlueprintComponents';
import { componentsBlueprintName } from '../packageName';
import { componentsDialogTemplates, componentsScreenTemplates } from '../templates';
import { componentsBlueprintCatalog, componentsBlueprintProfile, primeReactComponentNames } from './previewProfile';
import { componentsGalleryScreen, componentsGalleryScreens } from './screens';

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
const previewComponent = ({ element }: RegisteredComponentProps) => <span data-preview-component={element.componentName}>{String(element.properties.label ?? element.componentName)}</span>;

export const componentsPreviewBundles: ScenePackageBundle[] = [
    corePackage,
    {
        manifest: {
            name: 'Tailwind',
            version: '4.0.0',
            kind: PackageKind.Styling,
            dependencies: [],
            components: [],
            layouts: [],
            screenTemplates: [],
            dialogTemplates: [],
            themes: [],
            assets: ['styles/tailwind.css', 'fonts/inter.woff2'],
        },
        components: {},
    },
    {
        manifest: {
            name: 'PrimeReact',
            version: '11.1.0',
            kind: PackageKind.ComponentLibrary,
            dependencies: [{ name: 'Tailwind' }],
            components: primeReactComponentNames,
            layouts: [],
            screenTemplates: [],
            dialogTemplates: [],
            themes: [],
        },
        components: Object.fromEntries(primeReactComponentNames.map(name => [`PrimeReact:${name}`, previewComponent])),
    },
    cratisComponentsPackage,
    defaultBlueprint,
    {
        manifest: {
            name: componentsBlueprintName,
            version: '1.0.0',
            kind: PackageKind.Blueprint,
            dependencies: [{ name: 'Cratis.Blueprint.Default' }, { name: 'Cratis.Components' }],
            components: Object.keys(componentsBlueprintComponents).map(name => name.slice(`${componentsBlueprintName}:`.length)),
            layouts: [],
            screenTemplates: componentsScreenTemplates.map(template => template.name),
            dialogTemplates: componentsDialogTemplates.map(template => template.name),
            themes: [],
        },
        components: componentsBlueprintComponents,
        screenTemplates: componentsScreenTemplates,
        dialogTemplates: componentsDialogTemplates,
        screens: componentsGalleryScreens,
    },
];

/** Compatibility registry for callers that render individual gallery elements directly. */
export const componentsPreviewRegistry: ComponentRegistry = resolvePackageHost({
    profile: componentsBlueprintProfile,
    bundles: componentsPreviewBundles,
    policy: { allowExecutableImports: false, allowNetworkAssets: false },
}).components;

export interface GalleryScreenPreviewProps {
    /** The name of the gallery screen to boot. */
    screenName: string;

    /** Configuration to start from - a story pinning a layout mode, or a host restoring a session. */
    initialConfig?: Partial<LayoutConfigState>;

    /** The approved package set to render against. Defaults to {@link componentsPreviewBundles}. */
    bundles?: ScenePackageBundle[];
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
export function GalleryScreenPreview({ screenName, initialConfig, bundles = componentsPreviewBundles }: GalleryScreenPreviewProps) {
    const element = useMemo(() => {
        const screen = componentsGalleryScreen(screenName);
        if (!screen) {
            throw new Error(`The gallery has no screen named '${screenName}'.`);
        }

        return resolveElementComponentNames(composeScreenElement(screen), componentsBlueprintProfile, componentsBlueprintCatalog);
    }, [screenName]);

    return (
        <PrimeReactProvider>
            <LayoutConfigProvider initialConfig={initialConfig} storage={null}>
                <LayoutThemeProvider themes={defaultBlueprintThemes}>
                    <PackageHostView
                        configuration={{
                            profile: componentsBlueprintProfile,
                            bundles,
                            policy: { allowExecutableImports: false, allowNetworkAssets: false },
                        }}
                        element={element} />
                </LayoutThemeProvider>
            </LayoutConfigProvider>
        </PrimeReactProvider>
    );
}
