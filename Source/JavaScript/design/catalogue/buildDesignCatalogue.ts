// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentCategory, ComponentDescriptor, DesignComponent, DesignSystem, PropertyDescriptor, PropertyValueType, ScreenTemplate, SceneElement, TemplateRole } from '@cratis/scene.model';
import {
    DesignAnatomyEntry, DesignCatalogue, DesignComponentEntry, DesignOutletRule, DesignPlacement, DesignProfileValues, DesignPropertyEntry,
    DesignShapeEntry, DesignSystemComponentEntry, DesignTemplateEntry, DesignThemeEntry, DesignTokenEntry, DesignValueKind,
} from './DesignCatalogue';
import { DesignCatalogueInput, DesignOutletRuleInput } from './DesignCatalogueInput';
import { acceptsComponent } from './outlets';

const shellCategory = 'Shell';
const variantPropertyNames = ['variant', 'emphasis'];

/** The part of a component id after the package: `Cratis.Blueprint.Default:Button` is `Button`. */
export const bareComponentName = (name: string): string => name.slice(name.lastIndexOf(':') + 1);

/** A name compared without case or separators, the way a design system's component is matched to a Scene component. */
export const normalizeName = (name: string): string => name.toLowerCase().replace(/[\s._-]/g, '');

const packageOf = (name: string): string | undefined => name.includes(':') ? name.slice(0, name.indexOf(':')) : undefined;

const kindOf = (property: PropertyDescriptor): DesignValueKind => {
    switch (property.valueType) {
        case PropertyValueType.String: return property.choices !== undefined && property.choices.length > 0 ? 'choice' : 'text';
        case PropertyValueType.Number: return 'number';
        case PropertyValueType.Boolean: return 'boolean';
        case PropertyValueType.Enum: return 'choice';
        case PropertyValueType.Icon: return 'icon';
        case PropertyValueType.Destination: return 'destination';
        case PropertyValueType.QueryReference: return 'query';
        case PropertyValueType.Collection: return 'list';
        case PropertyValueType.Object: return 'object';
        default: return 'json';
    }
};

function boundDesignComponent(descriptor: ComponentDescriptor, designSystem: DesignSystem | undefined): DesignComponent | undefined {
    if (designSystem === undefined) return undefined;
    return designSystem.components.find(candidate => candidate.mapping?.mapsTo === descriptor.component)
        ?? designSystem.components.find(candidate => normalizeName(candidate.name) === normalizeName(bareComponentName(descriptor.component)));
}

const intersect = (declared: string[], allowed: string[]): string[] => declared.filter(value => allowed.includes(value));

/** The look a component may take: what its descriptor declares, limited to what the design system declares for the component it is bound to. */
function resolveAnatomy(descriptor: ComponentDescriptor, designSystem: DesignSystem | undefined): DesignAnatomyEntry | undefined {
    const anatomy = descriptor.anatomy;
    if (anatomy === undefined) return undefined;
    const bound = boundDesignComponent(descriptor, designSystem);
    const variantProperty = bound?.mapping?.variantProperty ?? anatomy.variantProperty
        ?? variantPropertyNames.find(name => descriptor.properties.some(property => property.path === name));
    const resolved: DesignAnatomyEntry = { parts: [...anatomy.parts], variants: [...anatomy.variants], states: [...anatomy.states] };
    if (bound !== undefined) {
        const variantValue = (name: string) => bound.mapping?.variantValues?.[name] ?? name;
        resolved.parts = intersect(anatomy.parts, bound.parts);
        resolved.variants = intersect(anatomy.variants, bound.variants.map(variant => variantValue(variant.name)));
        resolved.states = intersect(anatomy.states, bound.variants.flatMap(variant => Object.keys(variant.states ?? {})));
        resolved.designSystemComponent = bound.name;
    }
    if (variantProperty !== undefined) resolved.variantProperty = variantProperty;
    return resolved;
}

function propertyEntry(property: PropertyDescriptor, anatomy: DesignAnatomyEntry | undefined): DesignPropertyEntry {
    const entry: DesignPropertyEntry = { name: property.path, label: property.label, kind: kindOf(property) };
    const choices = property.choices?.map(choice => choice.value);
    if (choices !== undefined && choices.length > 0) entry.choices = choices;
    if (anatomy?.variantProperty === property.path && anatomy.variants.length > 0) {
        entry.kind = 'choice';
        entry.choices = [...anatomy.variants];
    }
    if (property.constraints?.required === true) entry.required = true;
    if (property.description !== undefined) entry.description = property.description;
    if (property.constraints?.minimum !== undefined) entry.minimum = property.constraints.minimum;
    if (property.constraints?.maximum !== undefined) entry.maximum = property.constraints.maximum;
    return entry;
}

function placementOf(descriptor: ComponentDescriptor, shellComponents: string[]): DesignPlacement {
    if (descriptor.category === ComponentCategory.Overlay) return 'overlay';
    if (descriptor.category === shellCategory || shellComponents.includes(descriptor.component) || shellComponents.includes(bareComponentName(descriptor.component))) return 'shell';
    return 'outlet';
}

function componentEntry(descriptor: ComponentDescriptor, designSystem: DesignSystem | undefined, shellComponents: string[]): DesignComponentEntry {
    const anatomy = resolveAnatomy(descriptor, designSystem);
    const entry: DesignComponentEntry = {
        name: descriptor.component,
        label: descriptor.displayName ?? bareComponentName(descriptor.component),
        category: descriptor.category ?? '',
        placement: placementOf(descriptor, shellComponents),
        properties: descriptor.properties.map(property => propertyEntry(property, anatomy)),
        fits: [],
    };
    const packageName = packageOf(descriptor.component);
    if (packageName !== undefined) entry.package = packageName;
    if (descriptor.description !== undefined) entry.description = descriptor.description;
    if (anatomy !== undefined) entry.anatomy = anatomy;
    return entry;
}

const unique = (values: string[]): string[] => [...new Set(values)];

function componentNameOf(element: SceneElement): string | undefined {
    const name = (element as { componentName?: unknown }).componentName;
    return typeof name === 'string' ? name : undefined;
}

function resolveComponentName(name: string, components: DesignComponentEntry[]): string {
    const exact = components.find(component => component.name === name);
    if (exact !== undefined) return exact.name;
    const matches = components.filter(component => normalizeName(bareComponentName(component.name)) === normalizeName(name));
    return matches.length === 1 ? matches[0].name : name;
}

/** What each outlet of a template takes: the host's rule, else what the template's own content for it implies, else anything. */
function outletRulesOf(template: ScreenTemplate, rules: Record<string, DesignOutletRuleInput> | undefined, components: DesignComponentEntry[]): DesignOutletRule[] {
    return template.slots.map(slot => {
        const explicit = rules?.[slot.name];
        const named = unique((template.content?.[slot.name] ?? []).map(componentNameOf).filter((name): name is string => name !== undefined)
            .map(name => resolveComponentName(name, components)));
        const derivedCategories = unique(named.map(name => components.find(component => component.name === name)?.category).filter((category): category is string => category !== undefined && category !== ''));
        const rule: DesignOutletRule = {
            name: slot.name,
            components: explicit?.components ?? named,
            categories: explicit?.categories ?? derivedCategories,
            open: explicit === undefined && named.length === 0,
        };
        if (explicit?.max !== undefined) rule.max = explicit.max;
        return rule;
    });
}

function templateEntry(template: ScreenTemplate, rules: Record<string, DesignOutletRuleInput> | undefined, components: DesignComponentEntry[]): DesignTemplateEntry {
    const entry: DesignTemplateEntry = { name: template.name, outlets: outletRulesOf(template, rules, components) };
    const displayName = template.displayName ?? template.metadata?.displayName;
    const description = template.description ?? template.metadata?.description;
    if (displayName !== undefined) entry.displayName = displayName;
    if (description !== undefined) entry.description = description;
    if (template.metadata?.type !== undefined) entry.type = template.metadata.type;
    if (template.metadata?.category !== undefined) entry.category = template.metadata.category;
    if (template.fitsSlot !== undefined) entry.fitsSlot = template.fitsSlot;
    return entry;
}

function tokenEntries(designSystem: DesignSystem): DesignTokenEntry[] {
    return designSystem.tokens.map(role => {
        const address = `${role.category}.${role.name}`;
        const entry: DesignTokenEntry = {
            address, category: role.category, name: role.name,
            values: designSystem.themes.flatMap(theme => theme.modes
                .filter(mode => mode.tokens[address] !== undefined)
                .map(mode => ({ theme: theme.name, mode: mode.mode, value: mode.tokens[address] }))),
        };
        if (role.description !== undefined) entry.description = role.description;
        return entry;
    });
}

function designComponentEntries(designSystem: DesignSystem, components: DesignComponentEntry[]): DesignSystemComponentEntry[] {
    return designSystem.components.map(component => {
        const entry: DesignSystemComponentEntry = {
            name: component.name,
            parts: [...component.parts],
            variants: component.variants.map(variant => ({ name: variant.name, states: Object.keys(variant.states ?? {}) })),
        };
        if (component.mapping?.mapsTo !== undefined) entry.mapsTo = component.mapping.mapsTo;
        const bound = components.find(candidate => candidate.anatomy?.designSystemComponent === component.name);
        if (bound !== undefined) entry.boundTo = bound.name;
        return entry;
    });
}

function themeEntries(input: DesignCatalogueInput): DesignThemeEntry[] {
    const themes: DesignThemeEntry[] = (input.designSystem?.themes ?? []).map(theme => {
        const entry: DesignThemeEntry = { name: theme.name, source: 'designSystem', modes: theme.modes.map(mode => mode.mode) };
        if (theme.isDefault === true) entry.isDefault = true;
        return entry;
    });
    for (const theme of input.themes ?? []) {
        if (themes.some(existing => existing.name === theme.name)) continue;
        const entry: DesignThemeEntry = { name: theme.name, source: 'package', modes: [] };
        if (theme.isDark === true) entry.isDark = true;
        themes.push(entry);
    }
    return themes;
}

function shapeEntries(input: DesignCatalogueInput): DesignShapeEntry[] {
    return [
        ...(input.shapes ?? []).map(shape => ({ name: shape.name, source: 'shape' as const, fields: shape.fields.map(field => ({ ...field })) })),
        ...(input.sampleData ?? []).map(shape => ({
            name: shape.name,
            source: 'sampleData' as const,
            fields: shape.fields.map(field => ({ name: field.name, ...(field.type ?? field.kind ? { type: (field.type ?? field.kind) as string } : {}) })),
        })),
    ];
}

/**
 * Builds the catalogue a design is grounded in. Deterministic: the same input always gives the same catalogue, in the order the input
 * lists things, so a tool that answers from it never invents a component, template, token or variant.
 */
export function buildDesignCatalogue(input: DesignCatalogueInput): DesignCatalogue {
    const shellComponents = input.shellComponents ?? [];
    const byId = new Map<string, DesignComponentEntry>();
    for (const descriptor of input.descriptors) byId.set(descriptor.component, componentEntry(descriptor, input.designSystem, shellComponents));
    const components = [...byId.values()];

    const allowed = input.templateSet === undefined ? undefined : new Set(input.templateSet);
    const isRoot = (template: ScreenTemplate) => template.metadata?.role === TemplateRole.Root;
    const listed = input.templates.filter(template => !isRoot(template) && (allowed === undefined || allowed.has(template.name)));
    const templates = listed.map(template => templateEntry(template, input.outletRules?.[template.name], components));
    for (const component of components) {
        component.fits = templates.flatMap(template => template.outlets.filter(outlet => acceptsComponent(outlet, component)).map(outlet => `${template.name}.${outlet.name}`));
    }

    const themes = themeEntries(input);
    const values: DesignProfileValues = {
        colorSchemes: ['Light', 'Dark', 'System'],
        corners: ['Sharp', 'Default', 'Round'],
        fonts: [...(input.fonts ?? [])],
        themes: themes.map(theme => theme.name),
        rootTemplates: input.templates.filter(isRoot).map(template => template.name),
        newScreenTemplates: templates.map(template => template.name),
    };

    const catalogue: DesignCatalogue = {
        tokens: input.designSystem === undefined ? [] : tokenEntries(input.designSystem),
        designComponents: input.designSystem === undefined ? [] : designComponentEntries(input.designSystem, components),
        themes,
        components,
        templates,
        shapes: shapeEntries(input),
        queries: (input.queries ?? []).map(query => ({
            id: query.id,
            name: query.name,
            resultShape: query.resultShape,
            fields: query.resultFields.map(field => ({ name: field.name, type: field.type })),
            parameters: query.parameters.map(parameter => parameter.name),
        })),
        commands: (input.commands ?? []).map(command => ({ id: command.id, name: command.name, inputs: [...command.inputs] })),
    };
    if (input.designSystem !== undefined) {
        catalogue.designSystem = input.designSystem.name;
        if (input.designSystem.words !== undefined) catalogue.words = input.designSystem.words;
    }
    if (input.profile !== undefined) {
        catalogue.profile = { name: input.profile.name, packages: [...input.profile.packages], values };
        if (input.profile.theme !== undefined) catalogue.profile.theme = input.profile.theme;
        if (input.profile.layout !== undefined) catalogue.profile.layout = input.profile.layout;
        if (input.profile.root !== undefined) catalogue.profile.root = input.profile.root.template.id;
    }
    if (input.templateSet !== undefined) catalogue.templateSet = [...input.templateSet];
    return catalogue;
}
