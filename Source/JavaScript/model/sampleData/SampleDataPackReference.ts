// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How a {@link ScenePackage} declares a sample-data pack it ships: the pack's identity, enough to list it in
 * a selector without loading it, and where its JSON file lives (`sampleData/<name>.json`).
 */
export interface SampleDataPackReference {
    /** The pack's identity; must equal the `id` inside the file. */
    id: string;

    /** The display name shown in a selector. */
    title: string;

    /** The BCP 47 locale tag of the pack's data. */
    locale: string;

    /** The package-relative path of the pack file, under `sampleData/` and ending in `.json`. */
    path: string;
}

export const SampleDataPackReferencePropertyNames: (keyof SampleDataPackReference)[] = ['id', 'title', 'locale', 'path'];
