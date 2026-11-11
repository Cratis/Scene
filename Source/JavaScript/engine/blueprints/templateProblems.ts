// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { navigationModes, normalizeNavigationMode } from '../profiles/shellOptions';
import { describeTemplateCatalog } from '../templates/describeTemplateCatalog';
import { TemplateSource } from '../templates/TemplateSource';
import { BlueprintSource } from './BlueprintSource';
import { thumbnailProblems } from './blueprintMetadataProblems';
import { blueprintTemplateTypes, businessCategoryPrefix } from './blueprintRules';

type TemplateMetadata = { type?: string; category?: string; thumbnail?: string; defaultMenuMode?: string; displayName?: string; description?: string };

interface TemplateEntry {
    name: string;
    displayName?: string;
    description?: string;
    metadata?: TemplateMetadata;
    describable: boolean;
}

/**
 * The rules for every template a blueprint provides: what the catalog reports, a display name and description, the shell card a default menu mode implies and, for a domain blueprint, a type, a business category and a thumbnail.
 *
 * @param source The blueprint.
 * @param library The other packages available.
 * @param domain Whether the blueprint is a domain blueprint.
 * @returns The problems.
 */
export function templateProblems(source: BlueprintSource, library: readonly TemplateSource[], domain: boolean): string[] {
    const problems = catalogProblems(source, library);
    for (const template of everyTemplate(source)) {
        const owner = `Template '${template.name}'`;
        if (template.describable) problems.push(...describedTemplateProblems(owner, template));
        problems.push(...shellCardProblems(owner, template, source.files));
        if (domain) problems.push(...domainTemplateProblems(owner, template.metadata, source.files));
    }

    return problems;
}

function everyTemplate(source: BlueprintSource): TemplateEntry[] {
    const described = [...(source.screenTemplates ?? []), ...(source.dialogTemplates ?? [])];
    return [
        ...(source.layouts ?? []).map(layout => ({ name: layout.name, metadata: layout.metadata, describable: false })),
        ...described.map(template => ({ name: template.name, displayName: template.displayName, description: template.description, metadata: template.metadata, describable: true })),
    ];
}

function catalogProblems(source: BlueprintSource, library: readonly TemplateSource[]): string[] {
    const others = library.filter(other => other.manifest.name !== source.manifest.name);
    return describeTemplateCatalog([source, ...others]).filter(candidate => candidate.package === source.manifest.name).flatMap(entry => entry.problems);
}

function describedTemplateProblems(owner: string, template: TemplateEntry): string[] {
    const problems: string[] = [];
    if ((template.displayName ?? '').trim() === '') problems.push(`${owner} declares no display name`);
    if ((template.description ?? '').trim() === '') problems.push(`${owner} declares no description`);
    return problems;
}

function domainTemplateProblems(owner: string, metadata: TemplateMetadata | undefined, files: string[] | undefined): string[] {
    return [...typeProblems(owner, metadata), ...categoryProblems(owner, metadata), ...thumbnailProblems(owner, metadata?.thumbnail, files)];
}

function typeProblems(owner: string, metadata: TemplateMetadata | undefined): string[] {
    if (metadata?.type === undefined) return [`${owner} declares no type`];
    return blueprintTemplateTypes.includes(metadata.type) ? [] : [`${owner} declares type '${metadata.type}', which is not one of ${blueprintTemplateTypes.join(', ')}`];
}

function categoryProblems(owner: string, metadata: TemplateMetadata | undefined): string[] {
    const category = metadata?.category;
    return category !== undefined && isOutsideBusinessCategories(category) ? [`${owner} declares category '${category}', which does not start with '${businessCategoryPrefix}'`] : [];
}

function isOutsideBusinessCategories(category: string): boolean {
    return category.trim() !== '' && !category.startsWith(businessCategoryPrefix);
}

/** A shell that declares a default menu mode is offered as a card, so it needs a valid mode, a title, a description and a wireframe thumbnail. */
function shellCardProblems(owner: string, template: TemplateEntry, files: string[] | undefined): string[] {
    const mode = template.metadata?.defaultMenuMode;
    if (mode === undefined) return [];

    const problems: string[] = [];
    if (normalizeNavigationMode(mode) === undefined) problems.push(`${owner} declares default menu mode '${mode}', which is not one of ${navigationModes.map(candidate => candidate.id).join(', ')}`);
    if ((template.metadata?.displayName ?? template.displayName ?? '').trim() === '') problems.push(`${owner} is offered as a shell card but declares no title`);
    if ((template.metadata?.description ?? template.description ?? '').trim() === '') problems.push(`${owner} is offered as a shell card but declares no description`);
    problems.push(...thumbnailProblems(owner, template.metadata?.thumbnail, files));
    return problems;
}
