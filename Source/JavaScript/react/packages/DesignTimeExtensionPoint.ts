// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The versioned design-time extension points a package can fill. The values are the keys shared by
 * `PackageDesignTimeMetadata` (what a manifest declares) and `DesignTimeBundle` (what a bundle provides).
 */
export enum DesignTimeExtensionPoint {
    Preview = 'previews',
    Designer = 'designers',
    PropertyEditor = 'propertyEditors',
    PropertyDisplay = 'propertyDisplays',
    Action = 'actions',
}

/** How a diagnostic names an extension point. */
export const designTimeExtensionPointLabels: Record<DesignTimeExtensionPoint, string> = {
    [DesignTimeExtensionPoint.Preview]: 'preview',
    [DesignTimeExtensionPoint.Designer]: 'designer',
    [DesignTimeExtensionPoint.PropertyEditor]: 'property editor',
    [DesignTimeExtensionPoint.PropertyDisplay]: 'property display',
    [DesignTimeExtensionPoint.Action]: 'action',
};
