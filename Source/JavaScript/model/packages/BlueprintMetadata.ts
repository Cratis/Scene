// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from './BlueprintScreen';

/**
 * What a domain blueprint declares about itself beyond what every package does: the business domain it serves, how it
 * is described in a gallery, and the ready-to-use screens it brings with their navigation.
 *
 * A blueprint's own version is {@link ScenePackage.version}: there is deliberately no second version here to drift from
 * it. That version is what a template reference pins (`TemplateReference.version`) and what "update available" compares.
 * Its sample-data packs are {@link ScenePackage.sampleData}; {@link BlueprintMetadata.defaultSampleData} chooses among them.
 */
export interface BlueprintMetadata {
    /** The business domain, as a lower-case slug (`crm`, `project-tracker`). Templates of the blueprint are categorised under `Business / <domain>`. */
    domain: string;

    /** One sentence, up to 200 characters, saying what the blueprint gives an application. Shown under the thumbnail in a gallery. */
    description: string;

    /** The package-relative path of the gallery thumbnail, `thumbnails/<name>.png`, `.webp`, `.jpg` or `.svg`. It is design-time only and never part of a runtime bundle. */
    thumbnail: string;

    /** The ready-to-use screens, in navigation order. */
    screenSet: BlueprintScreen[];

    /** The id of the sample-data pack a gallery preview and a new application start with; one of the package's `sampleData` ids. Required when the package ships more than one. */
    defaultSampleData?: string;
}

export const BlueprintMetadataPropertyNames: (keyof BlueprintMetadata)[] = ['domain', 'description', 'thumbnail', 'screenSet', 'defaultSampleData'];
