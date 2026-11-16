// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScope, SceneEdit, Screen } from '@cratis/scene.model';
import { DesignAlternative, DesignOperation, DesignSystemProposal, TweakControl } from './DesignOperation';
import { DesignWorkspace } from './DesignWorkspace';

/** Why an operation was refused, in the codes a tool or a canvas can act on. */
export const DesignRefusalCode = {
    EditUnknown: 'editUnknown',
    TargetMissing: 'targetMissing',
    ScreenUnknown: 'screenUnknown',
    ScreenExists: 'screenExists',
    TemplateUnknown: 'templateUnknown',
    TemplateExists: 'templateExists',
    TemplateNotInCatalogue: 'templateNotInCatalogue',
    TemplateNotInSet: 'templateNotInSet',
    NoLayout: 'noLayout',
    ElementUnknown: 'elementUnknown',
    ElementIdTaken: 'elementIdTaken',
    ComponentNotInCatalogue: 'componentNotInCatalogue',
    OverlayNeedsAction: 'overlayNeedsAction',
    ShellComponent: 'shellComponent',
    OutletUnknown: 'outletUnknown',
    OutletDoesNotAccept: 'outletDoesNotAccept',
    OutletFull: 'outletFull',
    PropertyUnknown: 'propertyUnknown',
    ValueNotAllowed: 'valueNotAllowed',
    VariantNotInDesignSystem: 'variantNotInDesignSystem',
    QueryUnknown: 'queryUnknown',
    DestinationUnknown: 'destinationUnknown',
    NoDestinationProperty: 'noDestinationProperty',
    FreeStylingNotAllowed: 'freeStylingNotAllowed',
    OffSystemValue: 'offSystemValue',
    NoProfile: 'noProfile',
    ProfileKeyUnknown: 'profileKeyUnknown',
    ProfileValueNotAllowed: 'profileValueNotAllowed',
    SlotExists: 'slotExists',
    SlotUnknown: 'slotUnknown',
    SlotInUse: 'slotInUse',
    ArrangementInvalid: 'arrangementInvalid',
    TooManyTemplates: 'tooManyTemplates',
    TooManyControls: 'tooManyControls',
    TweakUnresolved: 'tweakUnresolved',
    SceneRefused: 'sceneRefused',
} as const;

export type DesignRefusalCode = typeof DesignRefusalCode[keyof typeof DesignRefusalCode];

export interface DesignDiagnostic {
    code: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    screen?: string;
    template?: string;
    element?: string;
    path?: string;
}

/** Why an operation is not accepted, and the nearest ones that would be. */
export interface DesignRefusal {
    code: string;
    reason: string;
    alternatives: DesignAlternative[];
    /** The outlets that would take the component, when the refusal is about where it goes. */
    homes?: string[];
}

export type DesignValidation = { ok: true } | ({ ok: false } & DesignRefusal);

/** One of the layouts of a screen that variations offer: the screen as it would be on another template. */
export interface VariationCandidate {
    letter: 'A' | 'B' | 'C';
    template: string;
    screen: Screen;
    /** What did not fit the template and was left out, in words. */
    notCarriedOver: string[];
}

/** The scene edit lowered for an operation, with the scope it applies in. */
export interface ScopedSceneEdit {
    scope: EditingScope;
    edit: SceneEdit;
}

export interface DesignFocus {
    screen?: string;
    template?: string;
    element?: string;
}

/** What happened to one operation: applied, or refused with the reason and alternatives; either way with its diagnostics. */
export interface DesignOutcome {
    operation: DesignOperation;
    applied: boolean;
    summary?: string;
    code?: string;
    reason?: string;
    alternatives?: DesignAlternative[];
    diagnostics: DesignDiagnostic[];
    /** The Scene edits the operation lowered to and the engine applied. */
    sceneEdits: ScopedSceneEdit[];
    focus?: DesignFocus;
    controls?: TweakControl[];
    variations?: VariationCandidate[];
    proposals?: DesignSystemProposal[];
}

export interface DesignApplyResult {
    workspace: DesignWorkspace;
    outcomes: DesignOutcome[];
    /** Whether anything of the workspace changed: tweaks and variations only offer choices. */
    changed: boolean;
}
