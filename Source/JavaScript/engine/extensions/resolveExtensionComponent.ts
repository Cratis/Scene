// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ExtensionComponentManifest, ExtensionFrontendManifest, ExtensionPlatform } from '@cratis/scene.extensions';
import { ComponentResolution } from '../ComponentResolution';
import { PackageCatalog, resolveComponentName } from '../resolveComponentName';

/** An extension package active in a profile, with the frontend part of its manifest. */
export interface ExtensionPackageFrontend {
    /** The package name the profile lists. */
    package: string;

    /** The frontend manifest the package carries. */
    frontend: ExtensionFrontendManifest;
}

/** The outcome of resolving a component name across runtime packages and extension packages. */
export interface ExtensionComponentResolution {
    /** The package and bare name the requested name resolved to, with what it shadowed. */
    resolution: ComponentResolution;

    /** The extension's declaration, present exactly when the resolved package is an extension package. */
    extension?: ExtensionComponentManifest;

    /** Whether the component supports the requested platform; always true for a runtime package component. */
    supportsPlatform: boolean;
}

/**
 * Resolves a component name against a {@link UiProfile}'s packages where some are extension packages: the
 * extension components join the runtime packages' catalog, so one profile order decides every bare name and a
 * package-qualified name reaches an extension directly.
 *
 * @param requestedName The name as written on a screen.
 * @param profile The profile whose package list decides priority.
 * @param runtimeCatalog The component names of the runtime packages, keyed by package.
 * @param extensions The extension packages active in the profile.
 * @param platform The platform being rendered for.
 * @returns The resolution, or `undefined` when nothing in scope declares the name.
 */
export function resolveExtensionComponent(
    requestedName: string,
    profile: UiProfile,
    runtimeCatalog: PackageCatalog,
    extensions: ExtensionPackageFrontend[],
    platform: ExtensionPlatform = profile.targetPlatform
): ExtensionComponentResolution | undefined {
    const catalog: PackageCatalog = { ...runtimeCatalog };
    for (const extension of extensions) {
        catalog[extension.package] = extension.frontend.components.map(component => component.name);
    }

    const resolution = resolveComponentName(requestedName, profile, catalog);
    if (!resolution) {
        return undefined;
    }

    const owner = extensions.find(extension => extension.package === resolution.package);
    const extension = owner?.frontend.components.find(component => component.name === resolution.name);
    return {
        resolution,
        extension,
        supportsPlatform: extension ? extension.platforms.includes(platform) : true
    };
}
