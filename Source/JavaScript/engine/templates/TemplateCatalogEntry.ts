// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateAttribution, TemplateCompatibility, TemplateScope } from '@cratis/scene.model';
import { TemplateCatalogKind } from './TemplateCatalogKind';

/**
 * One template as a template browser reads it: what it is, where it comes from, what it needs and whether the
 * active package set can use it.
 */
export interface TemplateCatalogEntry {
    /** The package that provides the template. */
    package: string;

    /** The version of that package. */
    packageVersion: string;

    kind: TemplateCatalogKind;
    name: string;
    displayName?: string;
    description?: string;
    type?: string;
    category?: string;
    scopes?: TemplateScope[];
    compatibility?: TemplateCompatibility;
    attribution?: TemplateAttribution;
    license?: string;
    licenseUrl?: string;

    /** Whether the template's metadata is complete and every requirement is met. */
    compatible: boolean;

    /** Why it is not - missing or invalid metadata, or an unmet Scene or package requirement. */
    problems: string[];
}
