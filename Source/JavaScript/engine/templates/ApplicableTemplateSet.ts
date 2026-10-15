// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateMetadata, TemplateReference } from '@cratis/scene.model';
import { TemplateCatalogKind } from './TemplateCatalogKind';

/** One template that can be applied at a target, with the reference that selects it. */
export interface ApplicableTemplate {
    /** The package that provides the template. */
    package: string;

    /** The version of that package. */
    packageVersion: string;

    kind: TemplateCatalogKind;
    name: string;
    displayName?: string;
    description?: string;
    metadata?: TemplateMetadata;

    /** The reference that selects it: an own reference, or a blueprint reference pinned to `^<installed version>`. */
    reference: TemplateReference;
}

/** The applicable templates sharing one browse category, in browse order. */
export interface ApplicableTemplateGroup {
    /** The category, or undefined for templates that declare none. Uncategorized templates are listed last. */
    category?: string;

    templates: ApplicableTemplate[];
}

/** A blueprint that has at least one template applicable at the target, with those templates by category. */
export interface ApplicableBlueprint {
    /** The blueprint package name. */
    blueprint: string;

    /** The installed version of the blueprint. */
    version: string;

    /** A human-readable name for a picker, falling back to `blueprint`. */
    displayName?: string;

    categories: ApplicableTemplateGroup[];
}

/** What a template picker offers at a target: own templates by category first, then the blueprints that have anything applicable. */
export interface ApplicableTemplateSet {
    /** The own templates that apply, grouped by category. */
    own: ApplicableTemplateGroup[];

    /** The blueprints with at least one applicable template. A blueprint with none is omitted, never listed empty. */
    blueprints: ApplicableBlueprint[];
}
