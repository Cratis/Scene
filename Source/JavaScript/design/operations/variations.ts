// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement, Screen } from '@cratis/scene.model';
import { DesignOutletRule } from '../catalogue/DesignCatalogue';
import { acceptsComponent, findComponent, findTemplate } from '../catalogue/outlets';
import { maximumVariations } from './DesignOperation';
import { VariationCandidate } from './DesignOutcome';
import { DesignContext, DesignWorkspace } from './DesignWorkspace';
import { replaceScreen } from './applyLowering';
import { designMessages } from './designMessages';
import { componentNameOf } from './documentLookup';

const letters: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];

/** The templates to offer when none are asked for: the base template's own type first, then the rest, in catalogue order. */
function defaultTemplates(base: Screen, context: DesignContext): string[] {
    const baseEntry = base.screenTemplate === undefined ? undefined : findTemplate(context.catalogue, base.screenTemplate);
    const others = context.catalogue.templates.filter(template => template.name !== base.screenTemplate);
    const sameType = others.filter(template => baseEntry?.type !== undefined && template.type === baseEntry.type);
    const rest = others.filter(template => !sameType.includes(template));
    return [...sameType, ...rest].slice(0, maximumVariations).map(template => template.name);
}

/** Where an element goes on another template: the outlet it was in when that takes it, else the first outlet that does and has room. */
function homeOf(element: SceneElement, from: string, rules: DesignOutletRule[], counts: Map<string, number>, context: DesignContext): string | undefined {
    const component = findComponent(context.catalogue, componentNameOf(element));
    if (component === undefined) return undefined;
    const room = (rule: DesignOutletRule) => acceptsComponent(rule, component) && (rule.max === undefined || (counts.get(rule.name) ?? 0) < rule.max);
    const preferred = rules.find(rule => rule.name === from);
    if (preferred !== undefined && room(preferred)) return preferred.name;
    return rules.find(room)?.name;
}

/**
 * Up to three layouts of a screen on other templates. Each keeps what the screen holds where the new template has an outlet that takes it;
 * what has none is listed. The candidates are screens, not documents: a caller prints them as Screenplay text for the session.
 */
export function makeVariations(screenName: string, templates: readonly string[] | undefined, workspace: DesignWorkspace, context: DesignContext): VariationCandidate[] {
    const base = workspace.document.screens.find(screen => screen.name === screenName)!;
    const chosen = (templates !== undefined && templates.length > 0 ? [...templates] : defaultTemplates(base, context)).slice(0, maximumVariations);
    return chosen.flatMap((name, index) => {
        const entry = findTemplate(context.catalogue, name);
        const source = workspace.document.screenTemplates.find(template => template.name === name) ?? context.templates.find(template => template.name === name);
        if (entry === undefined || source === undefined) return [];
        const slotContent: Record<string, SceneElement[]> = Object.fromEntries(source.slots.map(slot => [slot.name, []]));
        const counts = new Map<string, number>();
        const notCarriedOver: string[] = [];
        for (const [outlet, elements] of Object.entries(base.slotContent)) {
            for (const element of elements) {
                const home = homeOf(element, outlet, entry.outlets, counts, context);
                if (home === undefined || slotContent[home] === undefined) {
                    notCarriedOver.push(designMessages.notCarriedOver(element.id, name));
                    continue;
                }
                slotContent[home].push(element);
                counts.set(home, (counts.get(home) ?? 0) + 1);
            }
        }
        return [{ letter: letters[index], template: name, screen: { ...base, screenTemplate: name, slotContent }, notCarriedOver }];
    });
}

/** Makes a candidate the screen's layout: the screen takes the candidate's content and template, which joins the document when it is not there. */
export function chooseVariation(workspace: DesignWorkspace, context: DesignContext, candidate: VariationCandidate): DesignWorkspace {
    const source = context.templates.find(template => template.name === candidate.template);
    return replaceScreen(workspace, candidate.screen, source);
}
