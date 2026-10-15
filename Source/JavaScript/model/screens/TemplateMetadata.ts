// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateAttribution } from './TemplateAttribution';
import { TemplateCompatibility } from './TemplateCompatibility';
import { TemplateSliceKind } from './TemplateSliceKind';

/** The application hierarchy at which a reusable template is selected. */
export enum TemplateScope {
    Application = 'Application',
    Module = 'Module',
    Feature = 'Feature',
    Subfeature = 'Subfeature',
    Slice = 'Slice',
}

/**
 * Semantic and browsing metadata. Category is required for blueprint templates and recommended for own templates. Type and category are open strings so packages can
 * introduce their own vocabulary without a Scene release. Category never determines applicability.
 */
export interface TemplateMetadata {
    /** Semantic role; built-in roles are ApplicationShell, Workspace, List, Detail, Form and Dialog. */
    type?: string;
    /** A package-defined browse category, preserved even when the host does not recognize it. */
    category?: string;
    /** Explicit scope restriction. Absent uses the structural role; an empty list allows no scope. */
    scopes?: TemplateScope[];
    /** The Scene and package versions the template requires. Required for every shipped template. */
    compatibility?: TemplateCompatibility;
    /** Who authored the template. Required for every shipped template. */
    attribution?: TemplateAttribution;
    /** The SPDX license identifier the template is available under, such as `MIT`. Required for every shipped template. */
    license?: string;
    /** An absolute `https` URL to the license terms. */
    licenseUrl?: string;
    /**
     * For a template that applies at {@link TemplateScope.Slice}, the slice kinds it applies to. Absent uses the
     * structural default: a dialog template applies to state change slices, a screen template to every kind that
     * presents something. Declaring slice kinds without scopes makes the default scope Slice.
     */
    sliceKinds?: TemplateSliceKind[];
}

export const TemplateMetadataPropertyNames: (keyof TemplateMetadata)[] = [
    'type', 'category', 'scopes', 'compatibility', 'attribution', 'license', 'licenseUrl', 'sliceKinds',
];
