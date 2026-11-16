// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Arrangement } from '@cratis/scene.model';

/** The keys of a UI profile a design may change. */
export const designProfileKeys = ['theme', 'colorScheme', 'accent', 'corners', 'font', 'rootTemplate', 'newScreenTemplate'] as const;

export type DesignProfileKey = typeof designProfileKeys[number];

/** A slot of a screen template being authored. */
export interface DesignSlot {
    name: string;
    description?: string;
    optional?: boolean;
    primary?: boolean;
    /** The semantic template types a screen must have to be placed in the slot. */
    accepts?: string[];
}

/** Where an edit applies: a screen, or - in template mode - a screen template. Exactly one is named. */
export interface DesignTarget {
    screen?: string;
    template?: string;
}

/** Adds a screen built on a template of the catalogue. */
export interface AddScreenOperation {
    op: 'addScreen';
    name: string;
    template: string;
}

export interface RemoveScreenOperation {
    op: 'removeScreen';
    name: string;
}

/** Moves a screen to a position in the screen set, which reorders the default storyline. */
export interface MoveScreenOperation {
    op: 'moveScreen';
    name: string;
    index: number;
}

/** Adds a screen template (template mode): its slots, how they are arranged, and the item outlets it offers. */
export interface AddTemplateOperation {
    op: 'addTemplate';
    name: string;
    displayName?: string;
    description?: string;
    fitsSlot?: string;
    type?: string;
    slots: DesignSlot[];
    arrangement?: Arrangement;
    /** The item outlets (toolbar, filters, row actions) the template offers, as Scene outlets. */
    outlets?: unknown[];
}

export interface AddSlotOperation {
    op: 'addSlot';
    template: string;
    slot: DesignSlot;
    index?: number;
}

export interface RemoveSlotOperation {
    op: 'removeSlot';
    template: string;
    slot: string;
}

/** Replaces the arrangement of a template's slots. */
export interface ArrangeOperation {
    op: 'arrange';
    template: string;
    arrangement: Arrangement;
}

/** Puts a component into an outlet - a slot of the screen's template, or of the template being authored. */
export interface InsertOperation extends DesignTarget {
    op: 'insert';
    outlet: string;
    component: string;
    /** The id of the new element, when the caller needs to name it; otherwise one is made. */
    id?: string;
    index?: number;
    props?: Record<string, unknown>;
}

export interface SetOperation extends DesignTarget {
    op: 'set';
    element: string;
    prop: string;
    value: unknown;
}

export interface RemoveOperation extends DesignTarget {
    op: 'remove';
    element: string;
}

export interface MoveOperation extends DesignTarget {
    op: 'move';
    element: string;
    outlet: string;
    index?: number;
}

/** Makes an element navigate to a screen. */
export interface LinkOperation extends DesignTarget {
    op: 'link';
    element: string;
    to: string;
    /** The destination property; the element's first destination property when absent. */
    prop?: string;
}

export interface ProfileOperation {
    op: 'profile';
    key: DesignProfileKey;
    value: string;
}

/** Asks for layouts of a screen on other templates. */
export interface VariationsOperation {
    op: 'variations';
    screen: string;
    templates?: string[];
}

export type TweakKind = 'hue' | 'choice';

/** Where a tweak control writes: a profile key, a property of an element, or a design-system token. */
export interface TweakAddress {
    kind: 'profile' | 'property' | 'token';
    key?: DesignProfileKey;
    screen?: string;
    template?: string;
    element?: string;
    prop?: string;
    token?: string;
}

export interface TweakControl {
    label: string;
    kind: TweakKind;
    address: TweakAddress;
    options?: string[];
}

export interface TweaksOperation {
    op: 'tweaks';
    controls: TweakControl[];
}

/** What the design system lacks that would let a request through: a token, a variant, a word or a component. */
export interface DesignSystemProposal {
    kind: 'token' | 'variant' | 'word' | 'component';
    summary: string;
    address?: string;
    component?: string;
    variant?: string;
    value?: string;
}

/** The nearest thing that would be accepted: operations to apply, or a change to propose to the design system. */
export interface DesignAlternative {
    label: string;
    operations?: DesignOperation[];
    proposal?: DesignSystemProposal;
}

/** Says no, with the reason and what to do instead. */
export interface RefuseOperation {
    op: 'refuse';
    code: string;
    reason: string;
    alternatives?: DesignAlternative[];
}

export type DesignOperation =
    | AddScreenOperation | RemoveScreenOperation | MoveScreenOperation
    | AddTemplateOperation | AddSlotOperation | RemoveSlotOperation | ArrangeOperation
    | InsertOperation | SetOperation | RemoveOperation | MoveOperation | LinkOperation
    | ProfileOperation | VariationsOperation | TweaksOperation | RefuseOperation;

export type DesignOperationKind = DesignOperation['op'];

export const maximumVariations = 3;
export const maximumTweaks = 5;
