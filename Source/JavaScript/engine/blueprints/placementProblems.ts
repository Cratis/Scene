// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate } from '@cratis/scene.model';
import { ScreenTemplateResolution, resolveScreenTemplates } from '../resolveScreenTemplates';
import { TemplateSource } from '../templates/TemplateSource';
import { BlueprintSource } from './BlueprintSource';

/**
 * The rules for placing the screen templates of a blueprint into the layouts available: placed somewhere, not nested in themselves and, for a domain blueprint, not ambiguous.
 *
 * @param source The blueprint.
 * @param library The other packages available.
 * @param label How the blueprint is named in a problem.
 * @param domain Whether the blueprint is a domain blueprint, for which ambiguity is a problem.
 * @returns The problems.
 */
export function placementProblems(source: BlueprintSource, library: readonly TemplateSource[], label: string, domain: boolean): string[] {
    const own: ScreenTemplate[] = (source.screenTemplates ?? []).filter(template => template.fitsSlot !== undefined);
    if (own.length === 0) return [];

    const layouts = [...(source.layouts ?? []), ...library.flatMap(other => other.layouts ?? [])];
    const everyTemplate = [...(source.screenTemplates ?? []), ...library.flatMap(other => other.screenTemplates ?? [])];
    if (layouts.length === 0) return [`${label} has no layout to place its screen templates in`];

    const resolutions = layouts.map(layout => resolveScreenTemplates(layout, everyTemplate));
    return own.filter(template => !isPlaced(template, resolutions)).flatMap(template => unplacedTemplateProblems(template, resolutions, domain));
}

function isPlaced(template: ScreenTemplate, resolutions: ScreenTemplateResolution[]): boolean {
    return resolutions.some(resolution => resolution.placements.some(placement => placement.template === template.name));
}

function unplacedTemplateProblems(template: ScreenTemplate, resolutions: ScreenTemplateResolution[], domain: boolean): string[] {
    const unplacedEverywhere = resolutions.flatMap(resolution => resolution.unplaced.filter(candidate => candidate.template === template.name));
    const unplaced = unplacedEverywhere.find(candidate => candidate.candidates.length > 1);
    const cyclic = resolutions.some(resolution => resolution.cycles.some(cycle => cycle.includes(template.name)));
    if (cyclic) return [`Template '${template.name}' is nested inside itself`];
    if (!unplaced) return [`Template '${template.name}' is unplaced: no layout or template declares slot '${template.fitsSlot}'`];
    return domain ? [`Template '${template.name}' is ambiguous: slot '${unplaced.slot}' is declared by ${unplaced.candidates.join(', ')}`] : [];
}
