// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowArrangement, FlowNode, SampleDataPack, ScreenTemplate } from '@cratis/scene.model';
import { resolveScreenTemplates } from '../resolveScreenTemplates';
import { findTemplateSampleRowLiterals } from '../sampleData/findSampleRowLiterals';
import { validateTemplateMetadata } from '../templates/validateTemplateMetadata';
import { TemplateSource } from '../templates/TemplateSource';
import { BlueprintSource } from './BlueprintSource';
import { blueprintTemplateTypes, isValidThumbnailPath } from './blueprintRules';

/** What {@link verifyTemplateDefinitionOfDone} holds a template to beyond the rules every template has. */
export interface TemplateDefinitionOfDoneOptions {
    /** The category prefix the template's category must start with, e.g. `Foundation /`. */
    categoryPrefix?: string;

    /** The sample-data pack the template is previewed with. When given, every query the template binds to must be answered by one of its shapes. */
    pack?: SampleDataPack;
}

interface ScannedElement { properties?: Record<string, unknown>; slots?: Record<string, ScannedElement[]> }

/**
 * The per-template definition of done (spec Part B 6), as one reusable check every blueprint package's specs call for each of its
 * templates: complete metadata, a type from the vocabulary, a category, a display name and a one-sentence description, a thumbnail
 * that is in the package, a slot arrangement that places every declared slot and no other, placement by the slot resolver (not
 * unplaced, not nested in itself), no inline sample rows (the preview data is a sample-data pack, SD1), and - given the pack - every
 * bound query answered by it. Verification of the whole package is {@link verifyBlueprintPackage}; this is the template-level
 * checklist a spec can assert for each template by name, so a failure says which template and which rule.
 *
 * @param template The screen template.
 * @param source The blueprint that provides it.
 * @param library The other packages available, so the template can be placed into their layouts.
 * @param options What else to hold it to.
 * @returns The problems; empty when the template is done.
 */
export function verifyTemplateDefinitionOfDone(template: ScreenTemplate, source: BlueprintSource, library: readonly TemplateSource[] = [], options: TemplateDefinitionOfDoneOptions = {}): string[] {
    const owner = `Template '${template.name}'`;
    const problems: string[] = [...validateTemplateMetadata(template.name, template.metadata)];
    const metadata = template.metadata;

    if ((template.displayName ?? '').trim() === '') problems.push(`${owner} declares no display name`);
    const description = (template.description ?? '').trim();
    if (description === '') problems.push(`${owner} declares no description`);
    else if (!/^\p{Lu}.*\.$/u.test(description) || description.includes('. ')) problems.push(`${owner} describes itself in more than one sentence, or without a full stop`);

    if (metadata?.type === undefined) problems.push(`${owner} declares no type`);
    else if (!blueprintTemplateTypes.includes(metadata.type)) problems.push(`${owner} declares type '${metadata.type}', which is not one of ${blueprintTemplateTypes.join(', ')}`);

    if ((metadata?.category ?? '').trim() === '') problems.push(`${owner} declares no category`);
    else if (options.categoryPrefix !== undefined && !metadata!.category!.startsWith(options.categoryPrefix)) problems.push(`${owner} declares category '${metadata!.category}', which does not start with '${options.categoryPrefix}'`);

    if ((metadata?.thumbnail ?? '').trim() === '') problems.push(`${owner} declares no thumbnail`);
    else if (!isValidThumbnailPath(metadata!.thumbnail)) problems.push(`${owner} declares thumbnail '${metadata!.thumbnail}', which is not 'thumbnails/<name>.png|webp|jpg|svg'`);
    else if (source.files !== undefined && !source.files.includes(metadata!.thumbnail!)) problems.push(`${owner} declares thumbnail '${metadata!.thumbnail}', which is not in the package`);

    problems.push(...slotProblems(template, owner));
    problems.push(...placementProblems(template, source, library, owner));

    for (const literal of findTemplateSampleRowLiterals(template.content as Record<string, ScannedElement[]> | undefined)) {
        problems.push(`${owner} carries sample rows inline at ${literal}; preview data belongs in a sample-data pack`);
    }

    if (options.pack !== undefined) {
        const shapes = new Set(options.pack.sets.map(set => set.shape));
        for (const query of queriesBoundBy(template).filter(name => !shapes.has(name))) {
            problems.push(`${owner} binds to query '${query}', which sample-data pack '${options.pack.id}' does not answer`);
        }
    }

    return problems;
}

function slotProblems(template: ScreenTemplate, owner: string): string[] {
    const declared = template.slots.map(slot => slot.name);
    const arranged = new Set<string>();
    const visit = (node: FlowNode | undefined) => {
        if (!node) return;
        const named = node as { slotName?: string; children?: FlowNode[] };
        if (named.slotName !== undefined) arranged.add(named.slotName);
        named.children?.forEach(visit);
    };

    const arrangement = template.arrangement as FlowArrangement | undefined;
    visit(arrangement?.root);
    arrangement?.overrides?.forEach(override => visit(override.root));

    const problems: string[] = [];
    for (const name of declared.filter(slot => !arranged.has(slot))) problems.push(`${owner} declares slot '${name}' but its arrangement never places it`);
    for (const name of [...arranged].filter(slot => !declared.includes(slot))) problems.push(`${owner} arranges slot '${name}', which it does not declare`);
    for (const name of Object.keys(template.content ?? {}).filter(slot => !declared.includes(slot))) problems.push(`${owner} fills slot '${name}', which it does not declare`);
    return problems;
}

function placementProblems(template: ScreenTemplate, source: BlueprintSource, library: readonly TemplateSource[], owner: string): string[] {
    if (template.fitsSlot === undefined) return [];
    const layouts = [...(source.layouts ?? []), ...library.flatMap(other => other.layouts ?? [])];
    const everyTemplate = [...(source.screenTemplates ?? []), ...library.flatMap(other => other.screenTemplates ?? [])];
    const resolutions = layouts.map(layout => resolveScreenTemplates(layout, everyTemplate));

    if (resolutions.some(resolution => resolution.placements.some(placement => placement.template === template.name))) return [];
    if (resolutions.some(resolution => resolution.cycles.some(cycle => cycle.includes(template.name)))) return [`${owner} is nested inside itself`];
    return [`${owner} is unplaced: no layout or template declares slot '${template.fitsSlot}'`];
}

function queriesBoundBy(template: ScreenTemplate): string[] {
    const queries = new Set<string>();
    const visitValue = (value: unknown) => {
        if (Array.isArray(value)) value.forEach(visitValue);
        else if (typeof value === 'object' && value !== null) {
            const candidate = value as { query?: unknown; path?: unknown };
            if (typeof candidate.query === 'string' && 'path' in candidate) queries.add(candidate.query);
            Object.values(value).forEach(visitValue);
        }
    };

    const visit = (elements: ScannedElement[] | undefined) => {
        for (const element of elements ?? []) {
            Object.values(element.properties ?? {}).forEach(visitValue);
            Object.values(element.slots ?? {}).forEach(visit);
        }
    };

    Object.values(template.content ?? {}).forEach(content => visit(content as ScannedElement[]));
    return [...queries].sort();
}
