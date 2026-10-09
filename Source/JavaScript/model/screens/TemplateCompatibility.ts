// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageDependency } from '../packages/PackageDependency';

/**
 * Which Scene and package versions a template was authored and verified against.
 *
 * A template names components, slots and bindings that only exist in particular versions of Scene and of
 * the packages that provide them. Declaring the ranges lets a catalog mark a template as incompatible with
 * the active package set before an author picks it, instead of rendering placeholders after they have.
 */
export interface TemplateCompatibility {
    /** The Scene model version range the template requires, such as `^4.13.0`. */
    scene: string;

    /** The packages, and their version ranges, whose components or layouts the template uses. */
    packages?: PackageDependency[];
}

export const TemplateCompatibilityPropertyNames: (keyof TemplateCompatibility)[] = ['scene', 'packages'];
