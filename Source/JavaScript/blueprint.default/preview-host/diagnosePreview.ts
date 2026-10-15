// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, Screen, SampleDataPack, Toolbar, ToolbarButton } from '@cratis/scene.model';
import {
    ApplicationStructureIndex, collectComponents, diagnoseNavigationRegions, resolveScreenTemplates,
    toolbarButtonFromItem, validateSampleDataSelection, validateToolbarButtons,
} from '@cratis/scene.engine';
import { ApplicationDocument } from './ApplicationDocument';
import { CompositionOptions, findLayout, templatePoolFor, templatesOf } from './composeApplication';
import { PreviewPlan, resolvePreviewPlan } from './resolvePreviewPlan';
import { PreviewTarget } from './PreviewTarget';
import { PreviewProblem, PreviewProblemCode, PreviewProblemSeverity } from './PreviewProblem';
import { previewProfile } from './previewProfile';

/** What {@link diagnosePreview} reads. */
export interface PreviewDiagnosisInput {
    document: ApplicationDocument;
    structure: ApplicationStructure | ApplicationStructureIndex;
    navigation?: NavigationModel;
    target: PreviewTarget;

    /** The packs available, for checking the profile's sample data selection. */
    packs?: SampleDataPack[];

    /** The composition options the host renders with, for the blueprint's layouts and templates. */
    composition?: CompositionOptions;
}

export interface PreviewDiagnosis {
    /** The plan the target resolved to; absent when it did not resolve. */
    plan?: PreviewPlan;

    /** The screen the preview's page is, when the plan has a feature. */
    screen?: Screen;

    problems: PreviewProblem[];
}

const make = (code: PreviewProblemCode, severity: PreviewProblemSeverity, message: string, nodeId?: string): PreviewProblem =>
    ({ code, severity, message, ...(nodeId === undefined ? {} : { nodeId }) });

/**
 * Finds what would break or mislead a preview before it renders (PRV8), using the same engine validators the editor and the
 * compiler use - nothing is judged here that the engine does not already judge:
 *
 * - the target must be in the structure, and a module must have a feature;
 * - the page - the screen named by the target's feature - must exist, with a layout and a template that can be found and placed;
 * - navigation (`diagnoseNavigationRegions`), toolbar buttons (`validateToolbarButtons`, whatever their severity), the structure's own
 *   ids and the sample data selection are reported as warnings: the preview still renders, an item or button just will not behave
 *   as authored.
 *
 * Errors block the preview - it shows these instead of a blank screen; the node id is what the host links to.
 */
export function diagnosePreview(input: PreviewDiagnosisInput): PreviewDiagnosis {
    const index = input.structure instanceof ApplicationStructureIndex ? input.structure : new ApplicationStructureIndex(input.structure);
    const options = input.composition ?? {};
    const problems: PreviewProblem[] = [];

    for (const diagnostic of index.diagnostics) {
        problems.push(make(PreviewProblemCode.StructureInvalid, PreviewProblemSeverity.Warning, diagnostic.message, diagnostic.id));
    }

    const { plan, problems: targetProblems } = resolvePreviewPlan(index, input.target);
    problems.push(...targetProblems);

    let screen: Screen | undefined;
    if (plan?.feature !== undefined) {
        screen = input.document.screens.find(candidate => candidate.name === plan.feature);
        // A slice is previewed over a minimal host page when its feature has no screen; a module or feature has nothing to show without one.
        if (!screen && plan.slice === undefined) {
            problems.push(make(PreviewProblemCode.ScreenMissing, PreviewProblemSeverity.Error, `The feature '${plan.feature}' has no screen in the document, so there is nothing to render.`, plan.feature));
        } else if (screen) {
            problems.push(...diagnoseScreen(input.document, screen, options));
        }
    }

    if (input.navigation) {
        for (const diagnostic of diagnoseNavigationRegions(index, input.navigation)) {
            problems.push(make(PreviewProblemCode.NavigationInvalid, PreviewProblemSeverity.Warning, diagnostic.message, diagnostic.entry));
        }
    }

    const buttons = input.document.screens.flatMap(candidate => collectComponents(candidate)
        .filter(component => component.componentName.endsWith('toolbarItem'))
        .map(component => toolbarButtonFromItem(component.id, component.properties as Record<string, unknown>))
        .filter((button): button is ToolbarButton => button !== undefined));
    const toolbar: Toolbar = { buttons };
    for (const diagnostic of validateToolbarButtons(index, toolbar)) {
        problems.push(make(PreviewProblemCode.ToolbarInvalid, PreviewProblemSeverity.Warning, diagnostic.message, diagnostic.button));
    }

    const selection = previewProfile(input.document.uiProfiles).sampleData;
    if (selection) {
        for (const message of validateSampleDataSelection(selection, input.packs ?? [])) {
            problems.push(make(PreviewProblemCode.SampleDataInvalid, PreviewProblemSeverity.Warning, message));
        }
    }

    return { plan, screen, problems };
}

function diagnoseScreen(document: ApplicationDocument, screen: Screen, options: CompositionOptions): PreviewProblem[] {
    const problems: PreviewProblem[] = [];
    const layout = findLayout(document, screen.layout, options);
    if (!layout) {
        problems.push(make(PreviewProblemCode.LayoutMissing, PreviewProblemSeverity.Error, `The screen '${screen.name}' uses the layout '${screen.layout}', which neither the document nor the blueprint provides.`, screen.name));
    }

    if (screen.screenTemplate === undefined) return problems;

    const templates = templatesOf(document, options);
    if (!templates.some(candidate => candidate.name === screen.screenTemplate)) {
        problems.push(make(PreviewProblemCode.TemplateMissing, PreviewProblemSeverity.Error, `The screen '${screen.name}' uses the template '${screen.screenTemplate}', which neither the document nor the blueprint provides.`, screen.name));
        return problems;
    }

    if (layout) {
        const resolution = resolveScreenTemplates(layout, templatePoolFor(document, screen, options));
        const unplaced = resolution.unplaced.find(candidate => candidate.template === screen.screenTemplate);
        if (unplaced) {
            problems.push(make(PreviewProblemCode.TemplateUnplaced, PreviewProblemSeverity.Error, `The template '${unplaced.template}' fits the slot '${unplaced.slot}', which ${unplaced.candidates.length === 0 ? 'nothing declares' : `${unplaced.candidates.join(' and ')} all declare`}.`, unplaced.template));
        }

        const cycle = resolution.cycles.find(candidate => candidate.includes(screen.screenTemplate!));
        if (cycle) {
            problems.push(make(PreviewProblemCode.TemplateUnplaced, PreviewProblemSeverity.Error, `The template '${screen.screenTemplate}' nests inside itself (${cycle.join(' → ')}).`, screen.screenTemplate));
        }
    }

    return problems;
}
