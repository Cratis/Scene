// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Where a referenced template comes from. */
export enum TemplateReferenceSource {
    /** A template the user created in the workspace. */
    Own = 'Own',
    /** A template shipped by a blueprint package, referenced by blueprint name, template name and version range. */
    Blueprint = 'Blueprint',
}

/**
 * How a module, feature or slice refers to the template it uses: an own template by name, or a blueprint
 * template by blueprint, name and the version range of the blueprint it was chosen from.
 */
export interface TemplateReference {
    /** Whether the template is the user's own or comes from a blueprint. */
    source: TemplateReferenceSource;
    /** The template's name - within the workspace for an own template, within the blueprint for a blueprint template. */
    id: string;
    /** The blueprint package name. Present exactly when `source` is {@link TemplateReferenceSource.Blueprint}. */
    blueprint?: string;
    /**
     * The semver range of the blueprint the reference accepts, such as `^1.2.0`. Defaults to the caret range of the
     * installed blueprint version when a reference is created; absent means any version. Only meaningful for a blueprint reference.
     */
    version?: string;
}

export const TemplateReferencePropertyNames: (keyof TemplateReference)[] = ['source', 'id', 'blueprint', 'version'];
