// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Why a preview could not be rendered, or rendered with a caveat. */
export enum PreviewProblemCode {
    /** The module, feature or slice the preview was asked for is not in the application structure. */
    TargetNotFound = 'targetNotFound',

    /** The module has no feature to show. */
    ModuleWithoutFeatures = 'moduleWithoutFeatures',

    /** The feature the preview shows has no screen in the document. */
    ScreenMissing = 'screenMissing',

    /** The slice is neither a State Change nor a State View, so there is nothing to preview. */
    SliceNotPreviewable = 'sliceNotPreviewable',

    /** A State View slice's data fragment was not found, so its feature's page is shown. */
    SliceFragmentMissing = 'sliceFragmentMissing',

    /** The slice owns no screen, so its dialog or fragment is drawn over a minimal host page rather than another slice's page. */
    SliceScreenMissing = 'sliceScreenMissing',

    /** The layout a screen names is neither in the document nor one the blueprint provides. */
    LayoutMissing = 'layoutMissing',

    /** The screen template a screen names is neither in the document nor one the blueprint provides. */
    TemplateMissing = 'templateMissing',

    /** A template found no single home in the layout, or nests inside itself. */
    TemplateUnplaced = 'templateUnplaced',

    /** The application structure has a duplicate or ambiguous id. */
    StructureInvalid = 'structureInvalid',

    /** A navigation item leads nowhere or collides with another (the engine's navigation diagnostics). */
    NavigationInvalid = 'navigationInvalid',

    /** A toolbar button's slice does not exist, is not a State Change or is empty (the engine's toolbar diagnostics). */
    ToolbarInvalid = 'toolbarInvalid',

    /** The profile's sample data selection names a pack or set that does not exist. */
    SampleDataInvalid = 'sampleDataInvalid',
}

/** How a problem affects the preview. */
export enum PreviewProblemSeverity {
    /** The preview cannot show what was asked for; the problems are shown instead of a blank screen. */
    Error = 'error',

    /** The preview renders, but something in the model will not behave as authored. */
    Warning = 'warning',
}

/**
 * One problem the preview found (PRV8): what it is, where, and a sentence an author can act on. The node id is what a host
 * links to - a screen, a template, a navigation item, a toolbar button, a module, feature or slice.
 */
export interface PreviewProblem {
    code: PreviewProblemCode;
    severity: PreviewProblemSeverity;
    message: string;

    /** The model node the problem is about, when it has one. */
    nodeId?: string;
}

/** Whether any of the problems stops the preview from rendering. */
export function hasBlockingProblem(problems: PreviewProblem[]): boolean {
    return problems.some(problem => problem.severity === PreviewProblemSeverity.Error);
}
