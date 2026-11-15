// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { type DesignCatalogueInput, type DesignSession, type DesignSessionEvent, buildDesignCatalogue } from '@cratis/scene.design';

/** A template a session can be allowed to use, and whether it is. */
export interface TemplateChoice {
    name: string;
    displayName: string;
    /** What to call it in a list: the display name, with the template's own name when several templates are called the same. */
    label: string;
    description?: string;
    type?: string;
    allowed: boolean;
}

/**
 * The templates of the active design system a session may be limited to, each marked as allowed or not by the session's current set. The
 * catalogue decides what a screen can be built on - root templates belong to a profile and are not listed - so the picker offers exactly
 * the templates the catalogue would, before any limit.
 */
export function templateChoices(input: DesignCatalogueInput, session: DesignSession): TemplateChoice[] {
    const { templateSet: _limit, ...unconstrained } = input;
    const set = session.templateSet;
    const templates = buildDesignCatalogue(unconstrained).templates;
    const shown = (template: { name: string; displayName?: string }): string => template.displayName ?? template.name;
    return templates.map(template => ({
        name: template.name,
        displayName: shown(template),
        label: templates.filter(other => shown(other) === shown(template)).length > 1 ? `${shown(template)} (${template.name})` : shown(template),
        ...(template.description === undefined ? {} : { description: template.description }),
        ...(template.type === undefined ? {} : { type: template.type }),
        allowed: set === undefined || set.includes(template.name),
    }));
}

/**
 * The set after one template is allowed or not. When every template is allowed the set is lifted, which is what an absent set means. The last
 * template allowed cannot be taken away: an empty set would mean no limit, which is the opposite of what asking for it says.
 */
export function toggleTemplate(choices: readonly TemplateChoice[], name: string): string[] | undefined {
    const allowed = choices.filter(choice => choice.name === name ? !choice.allowed : choice.allowed).map(choice => choice.name);
    const kept = allowed.length === 0 ? choices.filter(choice => choice.allowed).map(choice => choice.name) : allowed;
    return kept.length === choices.length ? undefined : kept;
}

/** The event that sets which templates the session may use; an absent set lifts the limit. */
export const templateSetEvent = (templateSet: string[] | undefined): DesignSessionEvent =>
    templateSet === undefined ? { type: 'DesignTemplateSetChanged' } : { type: 'DesignTemplateSetChanged', templateSet };

/** The templates a new screen may be built on: those the set allows. */
export const buildableTemplates = (choices: readonly TemplateChoice[]): TemplateChoice[] => choices.filter(choice => choice.allowed);
