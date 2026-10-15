// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateCatalogKind } from './TemplateCatalogKind';

/** The outcome of resolving a template reference against a template library. */
export enum TemplateReferenceStatus {
    /** The reference names a template that exists, at a version the reference accepts. */
    Resolved = 'Resolved',
    /** The reference is not well formed: an own reference carrying a blueprint or version, a blueprint reference without a blueprint, or an invalid version range. */
    Malformed = 'Malformed',
    /** No blueprint package of that name is available. */
    UnknownBlueprint = 'UnknownBlueprint',
    /** The installed version of the blueprint is outside the reference's version range: the blueprint has drifted from what was chosen. */
    VersionNotSatisfied = 'VersionNotSatisfied',
    /** The blueprint or workspace has no template of that name. */
    UnknownTemplate = 'UnknownTemplate',
}

/** The result of resolving a template reference. */
export interface TemplateReferenceResolution {
    status: TemplateReferenceStatus;

    /** The package providing the template, when it was found or its blueprint was. */
    package?: string;

    /** The installed version of that package. */
    packageVersion?: string;

    /** Which kind of template was found, when the status is Resolved. */
    kind?: TemplateCatalogKind;

    /** A diagnostic when the reference did not resolve. */
    message?: string;
}
