// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate } from '@cratis/scene.model';
import { DesignOutletRule } from '../catalogue/DesignCatalogue';
import { acceptsComponent, findComponent, findTemplate, homesOf } from '../catalogue/outlets';
import { DesignOperation, DesignTarget, maximumTweaks, maximumVariations } from './DesignOperation';
import { DesignRefusal, DesignRefusalCode, DesignValidation } from './DesignOutcome';
import { DesignContext, DesignWorkspace } from './DesignWorkspace';
import { alternativesFor } from './alternatives';
import { designMessages } from './designMessages';
import { checkProperty, refuse } from './designValues';
import { ResolvedTarget, componentNameOf, contentOf, findElement, idsInDocument, outletNamesOf, resolveTarget } from './documentLookup';
import { checkProfileValue } from './profileOperations';
import { resolveTweak } from './tweaks';

const openOutlet = (name: string): DesignOutletRule => ({ name, components: [], categories: [], open: true });

/** What each outlet of a target takes: the catalogue's rules for a screen's template, and anything for an outlet nothing is known about. */
export function outletRulesFor(workspace: DesignWorkspace, context: DesignContext, target: ResolvedTarget): DesignOutletRule[] {
    const names = outletNamesOf(workspace.document, target);
    const entry = target.kind === 'screen' && target.value.screenTemplate !== undefined ? findTemplate(context.catalogue, target.value.screenTemplate) : undefined;
    return names.map(name => entry?.outlets.find(outlet => outlet.name === name) ?? openOutlet(name));
}

const templateOutsideSet = (context: DesignContext, name: string): boolean => context.catalogue.templateSet !== undefined && !context.catalogue.templateSet.includes(name);

/** Why a template cannot be used: it is outside the set the design may use, or not in the catalogue. */
function templateRefusal(context: DesignContext, name: string): DesignRefusal | undefined {
    if (templateOutsideSet(context, name)) return refuse(DesignRefusalCode.TemplateNotInSet, designMessages.templateNotInSet(name, context.catalogue.templateSet!));
    if (findTemplate(context.catalogue, name) === undefined) return refuse(DesignRefusalCode.TemplateNotInCatalogue, designMessages.templateNotInCatalogue(name, context.catalogue.templates.map(template => template.name)));
    return undefined;
}

type Resolved = { target: ResolvedTarget } | { refusal: DesignRefusal };

function resolveOperationTarget(operation: DesignTarget, workspace: DesignWorkspace, context: DesignContext): Resolved {
    if ((operation.screen === undefined) === (operation.template === undefined)) return { refusal: refuse(DesignRefusalCode.TargetMissing, designMessages.targetMissing) };
    if (operation.template !== undefined && templateOutsideSet(context, operation.template)) {
        return { refusal: refuse(DesignRefusalCode.TemplateNotInSet, designMessages.templateNotInSet(operation.template, context.catalogue.templateSet!)) };
    }
    const target = resolveTarget(workspace.document, operation);
    if (target !== undefined) return { target };
    return { refusal: operation.screen !== undefined
        ? refuse(DesignRefusalCode.ScreenUnknown, designMessages.screenUnknown(operation.screen))
        : refuse(DesignRefusalCode.TemplateUnknown, designMessages.templateUnknown(operation.template!)) };
}

function placementRefusal(workspace: DesignWorkspace, context: DesignContext, target: ResolvedTarget, outletName: string, componentName: string): DesignRefusal | undefined {
    const component = findComponent(context.catalogue, componentName);
    if (component === undefined) return refuse(DesignRefusalCode.ComponentNotInCatalogue, designMessages.componentNotInCatalogue(componentName));
    if (component.placement === 'overlay') return refuse(DesignRefusalCode.OverlayNeedsAction, designMessages.overlayNeedsAction(component.label));
    if (component.placement === 'shell') return refuse(DesignRefusalCode.ShellComponent, designMessages.shellComponent(component.label));
    const rules = outletRulesFor(workspace, context, target);
    const homes = homesOf(rules, component);
    const outlet = rules.find(candidate => candidate.name === outletName);
    if (outlet === undefined) return refuse(DesignRefusalCode.OutletUnknown, designMessages.outletUnknown(target.name, outletName, homes), { homes });
    if (!acceptsComponent(outlet, component)) return refuse(DesignRefusalCode.OutletDoesNotAccept, designMessages.outletDoesNotAccept(outletName, component.label, homes), { homes });
    const count = (contentOf(target)[outletName] ?? []).length;
    if (outlet.max !== undefined && count >= outlet.max) {
        return refuse(DesignRefusalCode.OutletFull, designMessages.outletFull(outletName, outlet.max), { homes: homes.filter(home => home !== outletName) });
    }
    return undefined;
}

const referencedSlots = (arrangement: unknown, found: Set<string> = new Set()): Set<string> => {
    if (Array.isArray(arrangement)) arrangement.forEach(item => referencedSlots(item, found));
    else if (typeof arrangement === 'object' && arrangement !== null) {
        const record = arrangement as Record<string, unknown>;
        if (typeof record.slotName === 'string') found.add(record.slotName);
        Object.values(record).forEach(item => referencedSlots(item, found));
    }
    return found;
};

function arrangementRefusal(arrangement: unknown, slots: readonly string[]): DesignRefusal | undefined {
    const unknown = [...referencedSlots(arrangement)].find(slot => !slots.includes(slot));
    return unknown === undefined ? undefined : refuse(DesignRefusalCode.ArrangementInvalid, designMessages.arrangementInvalid(unknown));
}

function check(operation: DesignOperation, workspace: DesignWorkspace, context: DesignContext): DesignRefusal | undefined {
    const { catalogue } = context;
    const { document } = workspace;
    switch (operation.op) {
        case 'addScreen': {
            const problem = templateRefusal(context, operation.template);
            if (problem !== undefined) return problem;
            if (document.screens.some(screen => screen.name === operation.name) || workspace.screenSet.screens.includes(operation.name)) return refuse(DesignRefusalCode.ScreenExists, designMessages.screenExists(operation.name));
            return (workspace.profile?.layout ?? document.layouts[0]?.name) === undefined ? refuse(DesignRefusalCode.NoLayout, designMessages.noLayout) : undefined;
        }
        case 'removeScreen':
        case 'moveScreen':
            return document.screens.some(screen => screen.name === operation.name) ? undefined : refuse(DesignRefusalCode.ScreenUnknown, designMessages.screenUnknown(operation.name));
        case 'addTemplate': {
            if (templateOutsideSet(context, operation.name)) return refuse(DesignRefusalCode.TemplateNotInSet, designMessages.templateNotInSet(operation.name, catalogue.templateSet!));
            if (document.screenTemplates.some(template => template.name === operation.name)) return refuse(DesignRefusalCode.TemplateExists, designMessages.templateExists(operation.name));
            const names = operation.slots.map(slot => slot.name);
            if (names.some(name => name === '')) return refuse(DesignRefusalCode.SlotUnknown, designMessages.slotNameMissing);
            const duplicate = names.find((name, index) => names.indexOf(name) !== index);
            if (duplicate !== undefined) return refuse(DesignRefusalCode.SlotExists, designMessages.slotExists(operation.name, duplicate));
            return operation.arrangement === undefined ? undefined : arrangementRefusal(operation.arrangement, names);
        }
        case 'addSlot':
        case 'removeSlot':
        case 'arrange': {
            const resolved = resolveOperationTarget({ template: operation.template }, workspace, context);
            if ('refusal' in resolved) return resolved.refusal;
            const template = resolved.target.value as ScreenTemplate;
            const slots = template.slots.map(slot => slot.name);
            if (operation.op === 'addSlot') {
                if (operation.slot.name === '') return refuse(DesignRefusalCode.SlotUnknown, designMessages.slotNameMissing);
                return slots.includes(operation.slot.name) ? refuse(DesignRefusalCode.SlotExists, designMessages.slotExists(operation.template, operation.slot.name)) : undefined;
            }
            if (operation.op === 'removeSlot') {
                if (!slots.includes(operation.slot)) return refuse(DesignRefusalCode.SlotUnknown, designMessages.slotUnknown(operation.template, operation.slot));
                return referencedSlots(template.arrangement).has(operation.slot) ? refuse(DesignRefusalCode.SlotInUse, designMessages.slotInUse(operation.template, operation.slot)) : undefined;
            }
            return arrangementRefusal(operation.arrangement, slots);
        }
        case 'insert': {
            const resolved = resolveOperationTarget(operation, workspace, context);
            if ('refusal' in resolved) return resolved.refusal;
            const problem = placementRefusal(workspace, context, resolved.target, operation.outlet, operation.component);
            if (problem !== undefined) return problem;
            if (operation.id !== undefined && idsInDocument(document).has(operation.id)) return refuse(DesignRefusalCode.ElementIdTaken, designMessages.elementIdTaken(operation.id));
            const component = findComponent(catalogue, operation.component)!;
            for (const [name, value] of Object.entries(operation.props ?? {})) {
                const bad = checkProperty(component, name, value, catalogue);
                if (bad !== undefined) return bad;
            }
            return undefined;
        }
        case 'set':
        case 'remove':
        case 'move':
        case 'link': {
            const resolved = resolveOperationTarget(operation, workspace, context);
            if ('refusal' in resolved) return resolved.refusal;
            const place = findElement(resolved.target, operation.element);
            if (place === undefined) return refuse(DesignRefusalCode.ElementUnknown, designMessages.elementUnknown(operation.element));
            if (operation.op === 'remove') return undefined;
            const componentName = componentNameOf(place.element);
            if (operation.op === 'move') {
                return operation.outlet === place.outlet ? undefined : placementRefusal(workspace, context, resolved.target, operation.outlet, componentName);
            }
            const component = findComponent(catalogue, componentName);
            if (component === undefined) return refuse(DesignRefusalCode.ComponentNotInCatalogue, designMessages.componentNotInCatalogue(componentName));
            if (operation.op === 'set') return checkProperty(component, operation.prop, operation.value, catalogue);
            const property = operation.prop === undefined ? component.properties.find(candidate => candidate.kind === 'destination') : component.properties.find(candidate => candidate.name === operation.prop);
            if (property === undefined || property.kind !== 'destination') return refuse(DesignRefusalCode.NoDestinationProperty, designMessages.noDestinationProperty(component.label));
            return document.screens.some(screen => screen.name === operation.to) ? undefined : refuse(DesignRefusalCode.DestinationUnknown, designMessages.destinationUnknown(operation.to));
        }
        case 'profile':
            return checkProfileValue(catalogue, operation.key, operation.value) ?? (workspace.profile === undefined ? refuse(DesignRefusalCode.NoProfile, designMessages.noProfile) : undefined);
        case 'variations': {
            if (!document.screens.some(screen => screen.name === operation.screen)) return refuse(DesignRefusalCode.ScreenUnknown, designMessages.screenUnknown(operation.screen));
            const templates = operation.templates ?? [];
            if (templates.length > maximumVariations) return refuse(DesignRefusalCode.TooManyTemplates, designMessages.tooManyTemplates(maximumVariations));
            for (const name of templates) {
                const problem = templateRefusal(context, name);
                if (problem !== undefined) return problem;
            }
            return undefined;
        }
        case 'tweaks': {
            if (operation.controls.length > maximumTweaks) return refuse(DesignRefusalCode.TooManyControls, designMessages.tooManyControls(maximumTweaks));
            const unresolved = operation.controls.find(control => resolveTweak(control, workspace, context) === undefined);
            return unresolved === undefined ? undefined : refuse(DesignRefusalCode.TweakUnresolved, designMessages.tweakUnresolved(unresolved.label));
        }
        case 'refuse':
            return refuse(operation.code === '' ? DesignRefusalCode.FreeStylingNotAllowed : operation.code, operation.reason === '' ? designMessages.refusedByDefault : operation.reason, { alternatives: operation.alternatives ?? [] });
        default:
            return refuse(DesignRefusalCode.EditUnknown, designMessages.editUnknown(String((operation as { op?: unknown }).op)));
    }
}

/**
 * Checks an operation against the catalogue and the design as it is. A refused operation says why and offers the nearest ones that
 * would be accepted: free styling, a value of its own, a template outside the allowed set, a component an outlet does not take.
 */
export function validateDesignOperation(operation: DesignOperation, workspace: DesignWorkspace, context: DesignContext): DesignValidation {
    const problem = check(operation, workspace, context);
    if (problem === undefined) return { ok: true };
    const alternatives = problem.alternatives.length > 0 ? problem.alternatives : alternativesFor(operation, problem, workspace, context);
    return { ok: false, ...problem, alternatives };
}
