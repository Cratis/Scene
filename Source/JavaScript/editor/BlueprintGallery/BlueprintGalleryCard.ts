// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { BlueprintCatalogEntry, BlueprintCatalogSampleData } from '@cratis/scene.engine';
import { BlueprintInstallState } from './BlueprintInstallState';
import type { BlueprintUpdate } from './BlueprintUpdate';

/** One group of what a blueprint's templates are, by category. */
export interface BlueprintTemplateGroup {
    /** The category, or empty for templates that name none. */
    category: string;

    /** The display names of the templates in it, in the order the blueprint lists them. */
    templates: string[];
}

/** One blueprint as the gallery shows it. */
export interface BlueprintGalleryCard {
    /** The package name: the identity of the blueprint. */
    package: string;

    /** The name to show. */
    name: string;

    /** The version on offer. */
    version: string;

    /** The domain it serves, such as `crm`. */
    domain: string;

    /** What it is, in a sentence or two. */
    description: string;

    /** The thumbnail's path inside the package, for the host to turn into something an image can load. */
    thumbnail: string;

    /** The license short name, when the package states one. */
    license?: string;

    /** Where the blueprint stands in the profile. */
    state: BlueprintInstallState;

    /** The packages it requires and the ranges, as the manifest states them. */
    dependencies: BlueprintCatalogEntry['dependencies'];

    /** Its screens in navigation order: "what you get". */
    screens: BlueprintCatalogEntry['screens'];

    /** Its templates by category: "what you get". */
    templateGroups: BlueprintTemplateGroup[];

    /** How many templates it provides. */
    templateCount: number;

    /** The sample data a preview can use, the default pack first. */
    sampleData: BlueprintCatalogSampleData[];

    /** The worst thing the application's pinned references to it have to say; absent when they are all current (or there are none). */
    update?: BlueprintUpdate;
}
