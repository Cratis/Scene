// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

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
}

export const TemplateMetadataPropertyNames: (keyof TemplateMetadata)[] = ['type', 'category', 'scopes'];
