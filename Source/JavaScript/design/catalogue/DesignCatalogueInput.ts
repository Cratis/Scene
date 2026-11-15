// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, DesignSystem, QueryCandidate, SampleShape, ScreenTemplate, Theme, UiProfile } from '@cratis/scene.model';

/** A command the host lets a screen offer. */
export interface DesignCommand {
    id: string;
    name: string;
    inputs: string[];
}

/** A data shape the host declares. */
export interface DesignShape {
    name: string;
    fields: { name: string; type?: string }[];
}

/** What a host says one outlet takes, overriding what the template's own content implies. */
export interface DesignOutletRuleInput {
    components?: string[];
    categories?: string[];
    max?: number;
}

/**
 * Everything the catalogue is built from. Only the descriptors and templates are required; whatever else the host has -
 * a design system, themes, a profile, shapes, queries, commands and sample data - grounds the design further.
 */
export interface DesignCatalogueInput {
    designSystem?: DesignSystem;
    /** Flat themes the profile's packages ship, besides the design system's own. */
    themes?: Theme[];
    profile?: UiProfile;
    /** The component descriptors of the profile's packages. */
    descriptors: ComponentDescriptor[];
    /** The screen templates, including root templates (those whose metadata role is Root) that only a profile uses. */
    templates: ScreenTemplate[];
    /** What each outlet takes, by template name and then outlet name. */
    outletRules?: Record<string, Record<string, DesignOutletRuleInput>>;
    /** Components that belong to the root template, which a screen never places. Components of the Shell category are shell already. */
    shellComponents?: string[];
    /** The fonts the profile may name. */
    fonts?: string[];
    shapes?: DesignShape[];
    queries?: QueryCandidate[];
    commands?: DesignCommand[];
    sampleData?: SampleShape[];
    /** The templates a session may use. When given, the catalogue lists only these and anything else is refused. */
    templateSet?: string[];
}
