// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateAttribution } from './TemplateAttribution';
import { TemplateCompatibility } from './TemplateCompatibility';
import { SliceKind } from '../structure';

/** The application hierarchy at which a reusable template is selected. */
/** A structural role a template can take beyond its kind. */
export enum TemplateRole {
    /**
     * The application's root template - its shell. A screen template with this role and scope Application can be the shell
     * of an application exactly like a layout; it fits no slot of anything else.
     */
    Root = 'Root',
}

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
    sliceKinds?: SliceKind[];

    /** The package-relative path of the template's gallery thumbnail (`thumbnails/<name>.png|webp|jpg|svg`); required of every template of a domain blueprint. */
    thumbnail?: string;

    /** A structural role beyond the template's kind. `Root` marks a screen template that can be an application's shell. */
    role?: TemplateRole;

    /** For a shell: the name of the slot every screen's content is placed in. Absent means `content`. */
    primaryOutlet?: string;

    /** For a shell: the navigation mode the application starts in when the shell is chosen. The author can change it afterwards. */
    defaultMenuMode?: string;
}

export const TemplateMetadataPropertyNames: (keyof TemplateMetadata)[] = [
    'type', 'category', 'scopes', 'compatibility', 'attribution', 'license', 'licenseUrl', 'sliceKinds', 'thumbnail', 'role', 'primaryOutlet', 'defaultMenuMode',
];
