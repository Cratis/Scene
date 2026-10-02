// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What a {@link ScenePackage} of kind {@link PackageKind.IconLibrary} declares about its icons, beyond
 * what every package declares (name, version, license, dependencies, module).
 *
 * It is deliberately small. The icons themselves are not listed here: a library can ship thousands, and a
 * profile resolution that read every key of every library would defeat the point of resolving without
 * loading anything. The icon *catalog* - an {@link IconEntry} per icon - is loaded on demand from the
 * library's module, and each icon's artwork is loaded per icon by the renderer's adapter.
 */
export interface IconLibrary {
    /**
     * The style variants the library offers (`outline`, `solid` ...), empty when it has a single style.
     * Declared here so a picker can offer variant filters before it has loaded the catalog.
     */
    variants: string[];

    /**
     * The renderers the library ships an adapter for (`react` ...), so tooling can say whether the
     * library can render for the target a profile selects without loading it.
     */
    renderers: string[];

    /**
     * The credit line the library's license asks to be shown, for example "Icons by Lucide contributors".
     */
    attribution?: string;

    /**
     * Where the attribution points - the library's home or license page.
     */
    attributionUrl?: string;

    /**
     * How many icons the catalog holds, for a picker's "1,500 icons" before the catalog is loaded.
     */
    iconCount?: number;
}

export const IconLibraryPropertyNames: (keyof IconLibrary)[] = ['variants', 'renderers', 'attribution', 'attributionUrl', 'iconCount'];
