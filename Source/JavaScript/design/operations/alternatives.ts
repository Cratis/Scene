// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { findComponent } from '../catalogue/outlets';
import { DesignAlternative, DesignOperation } from './DesignOperation';
import { DesignRefusal, DesignRefusalCode } from './DesignOutcome';
import { DesignContext, DesignWorkspace } from './DesignWorkspace';
import { checkProperty, colourProperty } from './designValues';
import { componentNameOf, findElement, resolveTarget } from './documentLookup';
import { profileKeyValues, tokenProposal } from './profileOperations';

const first = <T>(items: readonly T[], count: number): T[] => items.slice(0, count);

/** The operations that name a screen or a template to change, retargeted at another template. */
type Targeted = Extract<DesignOperation, { op: 'insert' | 'set' | 'remove' | 'move' | 'link' }>;

const isTargeted = (operation: DesignOperation): operation is Targeted =>
    operation.op === 'insert' || operation.op === 'set' || operation.op === 'remove' || operation.op === 'move' || operation.op === 'link';

function templateAlternatives(operation: DesignOperation, workspace: DesignWorkspace, context: DesignContext): DesignAlternative[] {
    const listed = first(context.catalogue.templates.map(template => template.name), 3);
    switch (operation.op) {
        case 'addScreen': return listed.map(template => ({ label: `Use ${template}`, operations: [{ ...operation, template }] }));
        case 'variations': return listed.length === 0 ? [] : [{ label: 'Offer variations on the templates of the design', operations: [{ ...operation, templates: listed }] }];
        case 'addTemplate': return listed.map(template => ({ label: `Use ${template} as it is`, operations: [] }));
        default:
            if (isTargeted(operation) && operation.template !== undefined) {
                const inDocument = (context.catalogue.templateSet ?? []).filter(name => workspace.document.screenTemplates.some(template => template.name === name));
                return first(inDocument, 3).map(template => ({ label: `Change ${template} instead`, operations: [{ ...operation, template }] }));
            }
            return [];
    }
}

/** For free styling and values of its own: the variants the component has, and what the design system could gain. */
function offSystemAlternatives(operation: DesignOperation, refusal: DesignRefusal, workspace: DesignWorkspace, context: DesignContext): DesignAlternative[] {
    if (operation.op === 'set') {
        const target = resolveTarget(workspace.document, operation);
        const place = target === undefined ? undefined : findElement(target, operation.element);
        const component = place === undefined ? undefined : findComponent(context.catalogue, componentNameOf(place.element));
        if (component === undefined) return [];
        const variantProperty = component.anatomy?.variantProperty;
        const variants = component.anatomy?.variants ?? [];
        const alternatives: DesignAlternative[] = variantProperty === undefined
            ? []
            : first(variants, 2).map(variant => ({ label: `Use the ${variant} variant`, operations: [{ ...operation, prop: variantProperty, value: variant }] }));
        const asked = String(operation.value);
        const proposal = refusal.code === DesignRefusalCode.OffSystemValue || colourProperty.test(operation.prop)
            ? tokenProposal(asked)
            : { kind: 'variant' as const, component: component.label, summary: `Add a variant of ${component.label} for ${operation.prop}` };
        return [...alternatives, { label: 'Propose it to the design system', proposal }];
    }
    if (operation.op === 'insert') {
        const component = findComponent(context.catalogue, operation.component);
        if (component === undefined) return [];
        const props = Object.entries(operation.props ?? {});
        const offending = props.find(([name, value]) => checkProperty(component, name, value, context.catalogue)?.code === refusal.code);
        if (offending === undefined) return [];
        const rest = Object.fromEntries(props.filter(([name]) => name !== offending[0]));
        const proposal = refusal.code === DesignRefusalCode.OffSystemValue || colourProperty.test(offending[0])
            ? tokenProposal(String(offending[1]))
            : { kind: 'variant' as const, component: component.label, summary: `Add a variant of ${component.label} for ${offending[0]}` };
        return [
            { label: `Add ${component.label} without ${offending[0]}`, operations: [{ ...operation, props: rest }] },
            { label: 'Propose it to the design system', proposal },
        ];
    }
    return [];
}

/** When an operation is refused for a reason the design can route around: the nearest operations that would be accepted. */
export function alternativesFor(operation: DesignOperation, refusal: DesignRefusal, workspace: DesignWorkspace, context: DesignContext): DesignAlternative[] {
    switch (refusal.code) {
        case DesignRefusalCode.OutletUnknown:
        case DesignRefusalCode.OutletDoesNotAccept:
        case DesignRefusalCode.OutletFull:
            return (operation.op === 'insert' || operation.op === 'move') && refusal.homes !== undefined
                ? first(refusal.homes, 2).map(home => ({ label: `Put it in ${home}`, operations: [{ ...operation, outlet: home }] }))
                : [];
        case DesignRefusalCode.TemplateNotInSet:
        case DesignRefusalCode.TemplateNotInCatalogue:
            return templateAlternatives(operation, workspace, context);
        case DesignRefusalCode.QueryUnknown:
            return operation.op === 'set'
                ? first(context.catalogue.queries, 2).map(query => ({ label: `Use the query ${query.name}`, operations: [{ ...operation, value: query.name }] }))
                : [];
        case DesignRefusalCode.ValueNotAllowed:
        case DesignRefusalCode.VariantNotInDesignSystem: {
            if (operation.op !== 'set') return [];
            const target = resolveTarget(workspace.document, operation);
            const place = target === undefined ? undefined : findElement(target, operation.element);
            const component = place === undefined ? undefined : findComponent(context.catalogue, componentNameOf(place.element));
            const choices = component?.properties.find(property => property.name === operation.prop)?.choices ?? [];
            const alternatives: DesignAlternative[] = first(choices, 2).map(choice => ({ label: `Use ${choice}`, operations: [{ ...operation, value: choice }] }));
            if (refusal.code === DesignRefusalCode.VariantNotInDesignSystem && component !== undefined) {
                alternatives.push({ label: 'Propose it to the design system', proposal: { kind: 'variant', component: component.label, variant: String(operation.value), summary: `Add the ${String(operation.value)} variant of ${component.label}` } });
            }
            return alternatives;
        }
        case DesignRefusalCode.ProfileValueNotAllowed:
            return operation.op === 'profile'
                ? first(profileKeyValues(context.catalogue, operation.key) ?? [], 2).map(value => ({ label: `Use ${value}`, operations: [{ ...operation, value }] }))
                : [];
        case DesignRefusalCode.FreeStylingNotAllowed:
        case DesignRefusalCode.OffSystemValue:
            return offSystemAlternatives(operation, refusal, workspace, context);
        default:
            return [];
    }
}
