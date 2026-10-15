// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScreenTemplate } from '@cratis/scene.model';
import { isValidVersion } from '../packageVersionRange';
import { resolveScreenTemplates } from '../resolveScreenTemplates';
import { validateSampleDataPackages } from '../sampleData/validateSampleDataPackages';
import { describeTemplateCatalog } from '../templates/describeTemplateCatalog';
import { TemplateSource } from '../templates/TemplateSource';
import { BlueprintSource } from './BlueprintSource';
import {
    blueprintTemplateTypes, businessCategoryPrefix, foundationPackageName, isValidBlueprintDomain, isValidThumbnailPath, maximumBlueprintDescriptionLength,
} from './blueprintRules';

/** How a blueprint is verified. */
export interface BlueprintVerificationOptions {
    /** The package that provides the foundation set a domain blueprint must depend on. Defaults to {@link foundationPackageName}. */
    foundationPackage?: string;

    /** Whether a package without blueprint metadata is a problem. Set for every domain blueprint; unset for a package that only provides foundation layouts and templates. */
    requireBlueprintMetadata?: boolean;
}

/**
 * The definition of done for a blueprint (spec Part B 6), as rules a package can be held to: valid manifest and version; for a domain
 * blueprint its domain, description, thumbnail and screen set; every template with complete metadata, a category, a type from the
 * vocabulary, a description and a thumbnail; every template placed by the slot resolver, with nothing unplaced, ambiguous or nested in
 * itself (ambiguity is only a problem for a domain blueprint: the foundation's generic nesting chain fits slots many templates declare, and is chosen explicitly); sample data present, locale-tagged and valid; and a dependency on the foundation set. The C# engine
 * (`BlueprintVerification.Verify`) reports the same problems in the same order; both are asserted against
 * `blueprint-verification-fixtures.json`.
 *
 * @param source The blueprint to verify.
 * @param library The other packages available - above all the foundation set - so templates can be placed into its layouts and checked against its versions.
 * @param options How strictly to verify.
 * @returns The problems; empty when the blueprint is done.
 */
export function verifyBlueprintPackage(source: BlueprintSource, library: readonly TemplateSource[] = [], options: BlueprintVerificationOptions = {}): string[] {
    const manifest = source.manifest;
    const name = manifest.name;
    const label = `Blueprint '${name}'`;
    const foundation = options.foundationPackage ?? foundationPackageName;

    if (manifest.kind !== PackageKind.Blueprint) return [`Package '${name}' is not a Blueprint package`];

    const problems: string[] = [];
    if (!isValidVersion(manifest.version)) problems.push(`${label} declares an invalid version '${manifest.version ?? ''}'`);

    const blueprint = manifest.blueprint;
    const domain = blueprint !== undefined;
    const available = new Set([...(source.screenTemplates ?? []), ...library.flatMap(other => other.screenTemplates ?? [])].map(template => template.name));

    if (!blueprint) {
        if (options.requireBlueprintMetadata) problems.push(`${label} declares no blueprint metadata (domain, description, thumbnail and screen set)`);
    } else {
        if ((blueprint.domain ?? '').trim() === '') problems.push(`${label} declares no domain`);
        else if (!isValidBlueprintDomain(blueprint.domain)) problems.push(`${label} declares an invalid domain '${blueprint.domain}'; use lower-case words separated by '-'`);

        if ((blueprint.description ?? '').trim() === '') problems.push(`${label} declares no description`);
        else if (blueprint.description.length > maximumBlueprintDescriptionLength) problems.push(`${label} declares a description longer than ${maximumBlueprintDescriptionLength} characters`);

        problems.push(...thumbnailProblems(label, blueprint.thumbnail, source.files));
        problems.push(...screenSetProblems(source, label, available));

        if (blueprint.defaultSampleData !== undefined && !(manifest.sampleData ?? []).some(reference => reference.id === blueprint.defaultSampleData)) {
            problems.push(`${label} declares default sample data '${blueprint.defaultSampleData}', which is not one of its sample data packs`);
        }

        if ((manifest.sampleData ?? []).length === 0) problems.push(`${label} ships no sample data pack`);
        else if ((manifest.sampleData ?? []).length > 1 && blueprint.defaultSampleData === undefined) problems.push(`${label} ships several sample data packs but declares no default`);

        if (name !== foundation && !manifest.dependencies.some(dependency => dependency.name === foundation)) {
            problems.push(`${label} does not depend on the foundation set '${foundation}'`);
        }
    }

    problems.push(...validateSampleDataPackages([{ manifest, packs: source.packs }]));
    for (const reference of manifest.sampleData ?? []) {
        if (source.files !== undefined && !source.files.includes(reference.path)) problems.push(`${label} sample data pack '${reference.id}' names '${reference.path}', which is not in the package`);
    }

    problems.push(...templateProblems(source, library, domain));
    problems.push(...placementProblems(source, library, label, domain));
    return problems;
}

function thumbnailProblems(owner: string, thumbnail: string | undefined, files: string[] | undefined): string[] {
    if ((thumbnail ?? '').trim() === '') return [`${owner} declares no thumbnail`];
    if (!isValidThumbnailPath(thumbnail)) return [`${owner} declares thumbnail '${thumbnail}', which is not 'thumbnails/<name>.png|webp|jpg|svg'`];
    if (files !== undefined && !files.includes(thumbnail!)) return [`${owner} declares thumbnail '${thumbnail}', which is not in the package`];
    return [];
}

function screenSetProblems(source: BlueprintSource, label: string, availableTemplates: Set<string>): string[] {
    const set = source.manifest.blueprint!.screenSet ?? [];
    if (set.length === 0) return [`${label} declares no ready-to-use screen set`];

    const problems: string[] = [];
    const names = new Set<string>();
    for (const screen of set) {
        if ((screen.name ?? '').trim() === '') {
            problems.push(`${label} declares a screen set entry without a name`);
            continue;
        }

        if (names.has(screen.name)) problems.push(`${label} declares screen '${screen.name}' more than once`);
        names.add(screen.name);
    }

    for (const screen of set) {
        if ((screen.name ?? '').trim() === '') continue;
        const owner = `${label} screen '${screen.name}'`;
        if ((screen.title ?? '').trim() === '') problems.push(`${owner} declares no title`);
        if (screen.template !== undefined && !availableTemplates.has(screen.template)) problems.push(`${owner} uses template '${screen.template}', which is not available`);
        if (screen.parent !== undefined && !names.has(screen.parent)) problems.push(`${owner} has parent '${screen.parent}', which is not in the screen set`);
        if (source.screens !== undefined && !source.screens.some(candidate => candidate.name === screen.name)) problems.push(`${owner} is named in the screen set but the package does not provide it`);
    }

    for (const screen of set) {
        if (screen.parent !== undefined && names.has(screen.parent) && isOwnAncestor(screen.name, set)) problems.push(`${label} screen '${screen.name}' is its own ancestor`);
    }

    return problems;
}

function isOwnAncestor(name: string, set: { name: string; parent?: string }[]): boolean {
    const visited = new Set<string>();
    for (let current = set.find(screen => screen.name === name)?.parent; current !== undefined; current = set.find(screen => screen.name === current)?.parent) {
        if (current === name) return true;
        if (visited.has(current)) return false;
        visited.add(current);
    }

    return false;
}

function templateProblems(source: BlueprintSource, library: readonly TemplateSource[], domain: boolean): string[] {
    const problems: string[] = [];
    const described = [...(source.screenTemplates ?? []), ...(source.dialogTemplates ?? [])];
    const everyTemplate: { name: string; displayName?: string; description?: string; metadata?: { type?: string; category?: string; thumbnail?: string }; describable: boolean }[] = [
        ...(source.layouts ?? []).map(layout => ({ name: layout.name, metadata: layout.metadata, describable: false })),
        ...described.map(template => ({ name: template.name, displayName: template.displayName, description: template.description, metadata: template.metadata, describable: true })),
    ];

    const others = library.filter(other => other.manifest.name !== source.manifest.name);
    for (const entry of describeTemplateCatalog([source, ...others]).filter(candidate => candidate.package === source.manifest.name)) {
        problems.push(...entry.problems);
    }

    for (const template of everyTemplate) {
        const owner = `Template '${template.name}'`;
        if (template.describable && (template.displayName ?? '').trim() === '') problems.push(`${owner} declares no display name`);
        if (template.describable && (template.description ?? '').trim() === '') problems.push(`${owner} declares no description`);
        if (!domain) continue;

        const metadata = template.metadata;
        if (metadata?.type === undefined) problems.push(`${owner} declares no type`);
        else if (!blueprintTemplateTypes.includes(metadata.type)) problems.push(`${owner} declares type '${metadata.type}', which is not one of ${blueprintTemplateTypes.join(', ')}`);

        if (metadata?.category !== undefined && metadata.category.trim() !== '' && !metadata.category.startsWith(businessCategoryPrefix)) {
            problems.push(`${owner} declares category '${metadata.category}', which does not start with '${businessCategoryPrefix}'`);
        }

        problems.push(...thumbnailProblems(owner, metadata?.thumbnail, source.files));
    }

    return problems;
}

function placementProblems(source: BlueprintSource, library: readonly TemplateSource[], label: string, domain: boolean): string[] {
    const own: ScreenTemplate[] = (source.screenTemplates ?? []).filter(template => template.fitsSlot !== undefined);
    if (own.length === 0) return [];

    const layouts = [...(source.layouts ?? []), ...library.flatMap(other => other.layouts ?? [])];
    const everyTemplate = [...(source.screenTemplates ?? []), ...library.flatMap(other => other.screenTemplates ?? [])];
    if (layouts.length === 0) return [`${label} has no layout to place its screen templates in`];

    const resolutions = layouts.map(layout => ({ layout, resolution: resolveScreenTemplates(layout, everyTemplate) }));
    const problems: string[] = [];

    for (const template of own) {
        if (resolutions.some(({ resolution }) => resolution.placements.some(placement => placement.template === template.name))) continue;

        const unplacedEverywhere = resolutions.flatMap(({ resolution }) => resolution.unplaced.filter(candidate => candidate.template === template.name));
        const unplaced = unplacedEverywhere.find(candidate => candidate.candidates.length > 1);
        const cyclic = resolutions.some(({ resolution }) => resolution.cycles.some(cycle => cycle.includes(template.name)));
        if (cyclic) problems.push(`Template '${template.name}' is nested inside itself`);
        else if (unplaced && domain) problems.push(`Template '${template.name}' is ambiguous: slot '${unplaced.slot}' is declared by ${unplaced.candidates.join(', ')}`);
        else if (!unplaced) problems.push(`Template '${template.name}' is unplaced: no layout or template declares slot '${template.fitsSlot}'`);
    }

    return problems;
}
