// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateAttribution } from './TemplateAttribution';
import { TemplateCompatibility } from './TemplateCompatibility';

/** The application hierarchy at which a reusable template is selected. */
export enum TemplateScope {
    Application = 'Application',
    Module = 'Module',
    Feature = 'Feature',
    Subfeature = 'Subfeature',
    Slice = 'Slice',
}

/**
 * Optional semantic and browsing metadata. Type and category are open strings so packages can
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
}

export const TemplateMetadataPropertyNames: (keyof TemplateMetadata)[] = [
    'type', 'category', 'scopes', 'compatibility', 'attribution', 'license', 'licenseUrl',
];
