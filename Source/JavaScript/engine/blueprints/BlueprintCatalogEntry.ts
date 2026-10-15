// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** One screen of a blueprint's screen set, as the gallery lists it. */
export interface BlueprintCatalogScreen {
    name: string;
    title: string;
    description?: string;
    template?: string;
    parent?: string;
    order?: number;
}

/** One template a blueprint provides, as the gallery lists it. */
export interface BlueprintCatalogTemplate {
    name: string;
    kind: string;
    displayName?: string;
    description?: string;
    type?: string;
    category?: string;
    thumbnail?: string;
}

/** One sample-data pack a blueprint ships, as the gallery's preview-data selector lists it. */
export interface BlueprintCatalogSampleData {
    id: string;
    title: string;
    locale: string;
    path: string;
    default: boolean;
}

/**
 * One domain blueprint as the gallery and the CLI documentation read it: what it is, how to show it, what it brings and what it needs.
 * This is the shape of an entry of `blueprintCatalog.json`.
 */
export interface BlueprintCatalogEntry {
    package: string;
    version: string;
    domain: string;
    displayName?: string;
    description: string;
    thumbnail: string;
    license?: string;
    licenseUrl?: string;
    dependencies: { name: string; versionRange?: string }[];
    screens: BlueprintCatalogScreen[];
    templates: BlueprintCatalogTemplate[];
    sampleData: BlueprintCatalogSampleData[];
}

/** The file a blueprint package ships and the gallery reads: every domain blueprint the build knows, in package name order. */
export interface BlueprintCatalogFile {
    /** The version of this file's shape; a reader refuses a newer one. */
    schema: 1;
    blueprints: BlueprintCatalogEntry[];
}
