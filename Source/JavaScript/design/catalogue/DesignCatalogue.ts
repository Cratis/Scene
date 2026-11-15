// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignWords } from '@cratis/scene.model';

/** The kinds of value a component property takes, as a design sees them. */
export type DesignValueKind = 'text' | 'number' | 'boolean' | 'choice' | 'query' | 'icon' | 'destination' | 'list' | 'object' | 'json';

/** Where a component may be placed: into an outlet of a screen, opened by an action, or part of the root template. */
export type DesignPlacement = 'outlet' | 'overlay' | 'shell';

/** One property of a component, as the catalogue answers it. */
export interface DesignPropertyEntry {
    name: string;
    label: string;
    kind: DesignValueKind;
    /** The values a `choice` property takes - already limited to what the design system declares for the variant property. */
    choices?: (string | number)[];
    required?: boolean;
    description?: string;
    minimum?: number;
    maximum?: number;
}

/** What a design system lets a component look like: only the variants, states and parts both sides declare. */
export interface DesignAnatomyEntry {
    parts: string[];
    variants: string[];
    states: string[];
    /** The property that chooses the variant. */
    variantProperty?: string;
    /** The design system's component this one is bound to, when there is one. */
    designSystemComponent?: string;
}

/** One component a profile's packages contribute. */
export interface DesignComponentEntry {
    /** The id an element names: `componentName`. */
    name: string;
    label: string;
    category: string;
    placement: DesignPlacement;
    package?: string;
    description?: string;
    properties: DesignPropertyEntry[];
    anatomy?: DesignAnatomyEntry;
    /** The outlets that take it, as `Template.outlet`. */
    fits: string[];
}

/** What one outlet (a slot of a screen template) takes. */
export interface DesignOutletRule {
    name: string;
    /** Components named by the template's own content for the outlet, or by the host's rule. */
    components: string[];
    /** Categories the outlet takes. */
    categories: string[];
    /** An outlet nothing is known about takes any component that may be placed. */
    open: boolean;
    max?: number;
}

/** One screen template a screen may be built on. */
export interface DesignTemplateEntry {
    name: string;
    displayName?: string;
    description?: string;
    type?: string;
    category?: string;
    fitsSlot?: string;
    outlets: DesignOutletRule[];
}

export interface DesignTokenValue {
    theme: string;
    mode: string;
    value: string;
}

/** One token role of the design system, with its value in every theme and mode. */
export interface DesignTokenEntry {
    /** `category.name`. */
    address: string;
    category: string;
    name: string;
    description?: string;
    values: DesignTokenValue[];
}

export interface DesignVariantEntry {
    name: string;
    states: string[];
}

/** One component of the design system. */
export interface DesignSystemComponentEntry {
    name: string;
    parts: string[];
    variants: DesignVariantEntry[];
    mapsTo?: string;
    /** The Scene component it is bound to, when one is. */
    boundTo?: string;
}

export interface DesignThemeEntry {
    name: string;
    source: 'designSystem' | 'package';
    modes: string[];
    isDark?: boolean;
    isDefault?: boolean;
}

/** The values the profile's keys take. */
export interface DesignProfileValues {
    colorSchemes: string[];
    corners: string[];
    fonts: string[];
    themes: string[];
    rootTemplates: string[];
    newScreenTemplates: string[];
}

export interface DesignProfileEntry {
    name: string;
    theme?: string;
    layout?: string;
    root?: string;
    packages: string[];
    values: DesignProfileValues;
}

export interface DesignFieldEntry {
    name: string;
    type?: string;
}

/** A data shape a screen may show: a declared shape or a sample-data shape. */
export interface DesignShapeEntry {
    name: string;
    source: 'shape' | 'sampleData';
    fields: DesignFieldEntry[];
}

export interface DesignQueryEntry {
    id: string;
    name: string;
    resultShape: string;
    fields: DesignFieldEntry[];
    parameters: string[];
}

export interface DesignCommandEntry {
    id: string;
    name: string;
    inputs: string[];
}

/**
 * What a design is grounded in, built deterministically from the design system, the themes, the profile's packages, the screen
 * templates and what the host supplies. Every design operation is checked against it, and the AI read tools answer from it.
 */
export interface DesignCatalogue {
    designSystem?: string;
    tokens: DesignTokenEntry[];
    designComponents: DesignSystemComponentEntry[];
    words?: DesignWords;
    themes: DesignThemeEntry[];
    profile?: DesignProfileEntry;
    components: DesignComponentEntry[];
    templates: DesignTemplateEntry[];
    shapes: DesignShapeEntry[];
    queries: DesignQueryEntry[];
    commands: DesignCommandEntry[];
    /** The templates a session may use, when it is constrained; the catalogue lists only these. */
    templateSet?: string[];
}
