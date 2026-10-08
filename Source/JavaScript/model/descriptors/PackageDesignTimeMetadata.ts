// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Platform-neutral names of optional design-time extension points a package provides.
 */
export interface PackageDesignTimeMetadata {
    /** Named component preview renderers available in the package's design-time bundle. */
    previews: string[];

    /** Named full-component designers available in the package's design-time bundle. */
    designers: string[];

    /** Named property editors available in the package's design-time bundle. */
    propertyEditors: string[];

    /** Named property display renderers available in the package's design-time bundle. */
    propertyDisplays: string[];

    /** Named design-time action handlers available in the package's design-time bundle. */
    actions: string[];
}

export const PackageDesignTimeMetadataPropertyNames: (keyof PackageDesignTimeMetadata)[] = [
    'previews', 'designers', 'propertyEditors', 'propertyDisplays', 'actions',
];
