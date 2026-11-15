// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createDescriptorCatalog, resolveComponentName, toComponentCatalog, type DescriptorCatalog, type EffectiveIconCatalog, type PackageCatalog } from '@cratis/scene.engine';
import type { ComponentDescriptor, UiProfile } from '@cratis/scene.model';
import { componentRegistryKey, mergeIconAdapters, mergePackageRegistries, type ComponentRegistry, type DesignTimeHost, type IconAdapterRegistry, type ScenePackageBundle } from '@cratis/scene.react';
import { createDesignTimeHost } from './createDesignTimeHost';
import { effectiveIconCatalogOf } from '../../Icons/effectiveIconCatalogOf';
import type { ScreenEditorAppearance } from './ScreenEditorAppearance';
import { compositionProfileOf } from './compositionProfile';
import { legacyClassName } from '../PrototypeProjection/sceneComponentName';
import { serverPrototypeTypes } from './serverPrototypeTypes';
import { resolveStoredComponentName } from './storedComponentName';
import { withSampleContentProperties } from './withSampleContentProperties';
import { withOutletItemKind } from './withOutletItemKind';
import { withPlacementProperties } from './withPlacementProperties';

// The package whose components the earlier editor had classes for.
const legacyLibraryPackage = 'PrimeReact';

// Everything the editing surface needs to know about the packages a screen is built from.
export interface ScreenEditorRuntime {
    // Distinguishes one runtime from another, so an editor opened against one is not carried over to a different one.
    id: number;

    bundles: ScenePackageBundle[];
    registry: ComponentRegistry;
    packages: PackageCatalog;
    descriptors: ComponentDescriptor[];
    catalog: DescriptorCatalog;
    profile: UiProfile;

    // The profile composition resolves component names with: `profile` with the packages every host renders with admitted (see `compositionProfileOf`).
    compositionProfile: UiProfile;

    // How the host wants screens drawn, when it has a look of its own; see `profileTheme` for how it takes precedence over the profile's theme.
    appearance?: ScreenEditorAppearance;

    // The icons the profile's icon libraries offer, resolved by Scene. The editing context carries it so Scene checks icon
    // values against it, and the icon fields browse it. Its catalogs are read on demand: see `useLoadedIconCatalog`.
    icons: EffectiveIconCatalog;

    // Draws those icons: one adapter per icon-library bundle, to be provided around anything that renders the screen.
    iconAdapters: IconAdapterRegistry;

    // What the packages contribute at design time - previews, designers, property editors and displays, and actions -
    // resolved and checked by Scene.
    designTime: DesignTimeHost;

    // The descriptor as its package wrote it. A document names a component by its bare name and the editor describes that
    // name with an alias; the design-time host needs the package-qualified one to know whose contributions apply.
    packageDescriptorOf: (descriptor: ComponentDescriptor) => ComponentDescriptor;

    // Whether any package declares a component of this bare name.
    isKnownComponent: (bareName: string) => boolean;

    // The legacy type a component added in the new editor is written as for the readers of the earlier shape, if a legacy library
    // offers it and the server can read it back. A component without one is saved as an external component, under its name.
    legacyTypeOf: (componentName: string) => string | undefined;
}

// Builds the runtime from the bundles in play and the UI profile that selects among them.
let nextRuntimeId = 1;

export function createScreenEditorRuntime(bundles: ScenePackageBundle[], profile: UiProfile, appearance?: ScreenEditorAppearance): ScreenEditorRuntime {
    const packages = toComponentCatalog(bundles.map(bundle => bundle.manifest));
    const described = bundles.flatMap(bundle => bundle.descriptors ?? []);
    const known = new Set(described.map(descriptor => descriptor.component));
    // A component nobody wrote a descriptor for still has a position, a name and a place in the tree to edit, so it is
    // described by name alone rather than being refused every edit with "nothing describes this component".
    const bare = bundles.flatMap(bundle => bundle.manifest.components.map(name => ({ component: componentRegistryKey(bundle.manifest.name, name), displayName: name, properties: [] })))
        .filter(descriptor => !known.has(descriptor.component));
    const qualified = [...described, ...bare].map(withOutletItemKind).map(withSampleContentProperties).map(withPlacementProperties);
    const descriptors = [...qualified, ...aliasesForProfile(qualified, packages, profile)];
    const names = new Set(Object.values(packages).flat());
    const byComponent = new Map(qualified.map(descriptor => [descriptor.component, descriptor]));

    return {
        id: nextRuntimeId++,
        bundles,
        registry: mergePackageRegistries(bundles),
        packages,
        descriptors,
        catalog: createDescriptorCatalog(descriptors),
        profile,
        compositionProfile: compositionProfileOf(profile),
        ...(appearance ? { appearance } : {}),
        icons: effectiveIconCatalogOf(profile.packages, bundles),
        iconAdapters: mergeIconAdapters(bundles),
        designTime: createDesignTimeHost(bundles, profile),
        packageDescriptorOf: descriptor => {
            if (descriptor.component.includes(':')) return descriptor;
            const resolution = resolveComponentName(descriptor.component, profile, packages);
            return (resolution && byComponent.get(componentRegistryKey(resolution.package, resolution.name))) ?? descriptor;
        },
        isKnownComponent: name => names.has(name),
        legacyTypeOf: name => {
            const resolution = resolveStoredComponentName(name, profile, packages);
            const type = resolution?.package === legacyLibraryPackage ? `${legacyLibraryPackage}.${legacyClassName(resolution.name)}` : undefined;
            return type !== undefined && serverPrototypeTypes.has(type) ? type : undefined;
        },
    };
}

// A document stores a component by its bare name so the UI profile - not the document - decides which package
// implements it. Scene finds a descriptor by name, and a bare name that several packages declare matches none of them,
// so each bare name gets the descriptor of the package the profile resolves it to. Rendering resolves names the same way.
function aliasesForProfile(descriptors: readonly ComponentDescriptor[], packages: PackageCatalog, profile: UiProfile): ComponentDescriptor[] {
    const aliases: ComponentDescriptor[] = [];
    for (const name of new Set(Object.values(packages).flat())) {
        const resolution = resolveComponentName(name, profile, packages);
        const target = resolution && descriptors.find(descriptor => descriptor.component === componentRegistryKey(resolution.package, resolution.name));
        if (target) aliases.push({ ...target, component: name });
    }

    return aliases;
}
