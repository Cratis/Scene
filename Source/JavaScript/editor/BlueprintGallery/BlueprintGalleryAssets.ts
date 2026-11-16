// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SampleDataPack } from '@cratis/scene.model';

/**
 * What a blueprint package ships as files and the gallery needs as something it can use: the thumbnail an `<img>` can load and the sample-data packs a
 * preview reads. The host provides them because how a file inside an npm package becomes a URL is the bundler's business, not this package's.
 */
export interface BlueprintGalleryAssets {
    /**
     * The URL of a blueprint's thumbnail.
     *
     * @param blueprint The package name, such as `Cratis.Blueprint.Crm`.
     * @param path The thumbnail's path inside the package, as the blueprint catalog states it.
     * @returns The URL, or undefined when the host has none.
     */
    thumbnailUrl(blueprint: string, path: string): string | undefined;

    /**
     * The sample-data packs a blueprint ships, loaded. Asynchronous because a host will not ship every pack of every blueprint with the page that lists them.
     *
     * @param blueprint The package name.
     * @param packs The packs the blueprint's catalog lists - id, and path inside the package - default pack first.
     * @returns The packs that could be loaded, in the order given.
     */
    loadPacks(blueprint: string, packs: readonly { id: string; path: string }[]): Promise<SampleDataPack[]>;
}

/** Assets for a host that has none: no thumbnails, no packs - the cards say so and the preview draws generated data. */
export const noBlueprintGalleryAssets: BlueprintGalleryAssets = {
    thumbnailUrl: () => undefined,
    loadPacks: async () => [],
};
