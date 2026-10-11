// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackage } from '@cratis/scene.model';

/**
 * Where the runtime of an approved package comes from: the npm package the frontend build installs, and the
 * export of that package which is its {@link ScenePackageBundle}.
 */
export interface PackageModuleReference {
    /** The npm package name the build installs and imports, for example `@acme/scene.charts`. */
    npm: string;

    /** The npm version or range written into the application's `package.json`. */
    version: string;

    /** The named export of the npm package that is the package's runtime bundle. */
    export: string;

    /** Package-relative style sheets the application imports for the package. Never URLs. */
    styles?: string[];
}

/** One package a host approved: the declaration planning resolves a profile against, and where its runtime comes from. */
export interface ApprovedPackage {
    manifest: ScenePackage;
    module: PackageModuleReference;
}

/**
 * The custom runtime packages a host approved on top of the ones it ships. The document the CLI, Stage and a
 * React host share; `Cratis.Scene.Engine.Packages.ApprovedPackageSetJson` reads and writes the same JSON in .NET.
 */
export interface ApprovedPackageSet {
    version: 1;
    packages: ApprovedPackage[];
}
