// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintSource } from './BlueprintSource';
import { isValidBlueprintDomain, isValidThumbnailPath, maximumBlueprintDescriptionLength } from './blueprintRules';
import { screenSetProblems } from './screenSetProblems';

type Blueprint = NonNullable<BlueprintSource['manifest']['blueprint']>;

/**
 * The rules for the metadata of a domain blueprint: its domain, description, thumbnail, screen set, sample data and its dependency on the foundation set.
 *
 * @param source The blueprint.
 * @param label How the blueprint is named in a problem.
 * @param availableTemplates The names of the screen templates available to it.
 * @param foundation The package that provides the foundation set.
 * @returns The problems.
 */
export function blueprintMetadataProblems(source: BlueprintSource, label: string, availableTemplates: Set<string>, foundation: string): string[] {
    const blueprint = source.manifest.blueprint!;
    return [
        ...domainProblems(label, blueprint),
        ...descriptionProblems(label, blueprint),
        ...thumbnailProblems(label, blueprint.thumbnail, source.files),
        ...screenSetProblems(source, label, availableTemplates),
        ...sampleDataDefaultProblems(label, blueprint, (source.manifest.sampleData ?? []).map(reference => reference.id)),
        ...foundationDependencyProblems(source.manifest, label, foundation),
    ];
}

/**
 * Verifies a thumbnail reference.
 *
 * @param owner How the owner is named in a problem.
 * @param thumbnail The thumbnail path, if any.
 * @param files The files in the package, when known.
 * @returns The problems.
 */
export function thumbnailProblems(owner: string, thumbnail: string | undefined, files: string[] | undefined): string[] {
    if ((thumbnail ?? '').trim() === '') return [`${owner} declares no thumbnail`];
    if (!isValidThumbnailPath(thumbnail)) return [`${owner} declares thumbnail '${thumbnail}', which is not 'thumbnails/<name>.png|webp|jpg|svg'`];
    if (files !== undefined && !files.includes(thumbnail!)) return [`${owner} declares thumbnail '${thumbnail}', which is not in the package`];
    return [];
}

/**
 * Verifies that every sample data pack names a file in the package.
 *
 * @param source The blueprint.
 * @param label How the blueprint is named in a problem.
 * @returns The problems.
 */
export function sampleDataFileProblems(source: BlueprintSource, label: string): string[] {
    const problems: string[] = [];
    for (const reference of source.manifest.sampleData ?? []) {
        if (source.files !== undefined && !source.files.includes(reference.path)) problems.push(`${label} sample data pack '${reference.id}' names '${reference.path}', which is not in the package`);
    }

    return problems;
}

function domainProblems(label: string, blueprint: Blueprint): string[] {
    if ((blueprint.domain ?? '').trim() === '') return [`${label} declares no domain`];
    return isValidBlueprintDomain(blueprint.domain) ? [] : [`${label} declares an invalid domain '${blueprint.domain}'; use lower-case words separated by '-'`];
}

function descriptionProblems(label: string, blueprint: Blueprint): string[] {
    if ((blueprint.description ?? '').trim() === '') return [`${label} declares no description`];
    return blueprint.description.length > maximumBlueprintDescriptionLength ? [`${label} declares a description longer than ${maximumBlueprintDescriptionLength} characters`] : [];
}

function sampleDataDefaultProblems(label: string, blueprint: Blueprint, referenceIds: string[]): string[] {
    const problems: string[] = [];
    if (blueprint.defaultSampleData !== undefined && !referenceIds.includes(blueprint.defaultSampleData)) {
        problems.push(`${label} declares default sample data '${blueprint.defaultSampleData}', which is not one of its sample data packs`);
    }

    if (referenceIds.length === 0) problems.push(`${label} ships no sample data pack`);
    else if (referenceIds.length > 1 && blueprint.defaultSampleData === undefined) problems.push(`${label} ships several sample data packs but declares no default`);
    return problems;
}

function foundationDependencyProblems(manifest: BlueprintSource['manifest'], label: string, foundation: string): string[] {
    return manifest.name !== foundation && !manifest.dependencies.some(dependency => dependency.name === foundation)
        ? [`${label} does not depend on the foundation set '${foundation}'`]
        : [];
}
