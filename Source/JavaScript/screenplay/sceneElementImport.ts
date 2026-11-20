// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type {
    ComponentPropertySyntax, ScreenActionSyntax, ScreenComponentSyntax, ScreenDirectiveSyntax, ScreenSectionSyntax,
} from './Syntax/ScreenplaySyntax';
import type { JsonObject, JsonValue } from './json';
import { baseElement } from './sceneElementBase';
import { coreElementOf, isCoreElement } from './sceneCoreDirectives';
import { panelChildren, panelComponent } from './sceneElementFrame';
import type { SceneScreenNames } from './sceneScreenNames';
import { bindingToJson, expressionToJson } from './sceneValues';

// The mirror of SceneElementImport: typed Screenplay screen directives as the Scene elements the editor opens.

// The packages whose names are dotted, so a Screenplay component name 'Cratis.Components.commandForm' is the
// component 'commandForm' of 'Cratis.Components'. Any other name splits at its first dot.
const dottedPackages = ['Cratis.Blueprint.Components', 'Cratis.Blueprint.Default', 'Cratis.Components'];

const nameProperty = 'name';

export const elementsOf = (directives: readonly ScreenDirectiveSyntax[], names: SceneScreenNames): JsonValue[] =>
    directives.map(directive => elementOf(directive, names)).filter((element): element is JsonObject => element !== undefined);

// Whether a directive becomes a Scene element of its own - the mirror of SceneNative.IsTyped, which is what
// decides whether a directive travels in the document or has to be reported.
export const isTypedDirective = (directive: ScreenDirectiveSyntax): boolean =>
    directive.kind === 'ScreenComponentSyntax' ||
    directive.kind === 'ScreenSectionSyntax' ||
    directive.kind === 'ScreenActionSyntax' ||
    isCoreElement(directive);

const elementOf = (directive: ScreenDirectiveSyntax, names: SceneScreenNames): JsonObject | undefined => {
    if (directive.kind === 'ScreenComponentSyntax') {
        const component = directive as ScreenComponentSyntax;
        return component.component === panelComponent ? panelOf(component, names) : componentOf(component, names);
    }
    if (directive.kind === 'ScreenSectionSyntax') return sectionOf(directive as ScreenSectionSyntax, names);
    if (directive.kind === 'ScreenActionSyntax') return actionOf(directive as ScreenActionSyntax);
    return isCoreElement(directive) ? coreElementOf(directive, names) : undefined;
};

const componentOf = (component: ScreenComponentSyntax, names: SceneScreenNames): JsonObject => {
    const properties: JsonObject = {};
    for (const property of component.properties) {
        if (isElementName(property)) continue;
        properties[property.property] = property.binding
            ? bindingToJson(property.binding)
            : expressionToJson(property.value) ?? null;
    }

    const element = elementFor(component);
    element.componentName = sceneComponentName(component.component);
    element.properties = properties;
    const slots: JsonObject = {};
    for (const slot of component.slots) slots[slot.name] = elementsOf(slot.directives, names);
    element.slots = slots;

    if (component.context) element.context = bindingToJson(component.context);
    if (component.icon !== null && component.icon !== undefined) element.icon = component.icon;
    if (component.presentation.length > 0) {
        const presentation: JsonObject = {};
        for (const value of component.presentation) presentation[value.name] = value.value;
        element.presentation = presentation;
    }
    if (component.exposes.length > 0) {
        const exposes: JsonObject = {};
        for (const value of component.exposes) exposes[value.name] = bindingToJson(value.binding);
        element.exposes = exposes;
    }

    return element;
};

// A panel is the element that holds other elements, so its own properties sit on it rather than in `properties`.
const panelOf = (panel: ScreenComponentSyntax, names: SceneScreenNames): JsonObject => {
    const element = elementFor(panel);
    for (const property of panel.properties) {
        if (isElementName(property)) continue;
        element[property.property] = property.binding ? bindingToJson(property.binding) : expressionToJson(property.value) ?? null;
    }

    const children = panel.slots.filter(slot => slot.name === panelChildren).flatMap(slot => slot.directives);
    element[panelChildren] = elementsOf(children, names);
    return element;
};

const sectionOf = (section: ScreenSectionSyntax, names: SceneScreenNames): JsonObject => {
    const element = baseElement(section.name, section.name);
    element[panelChildren] = elementsOf(section.directives, names);
    return element;
};

const actionOf = (action: ScreenActionSyntax): JsonObject => {
    const element = baseElement(action.command, action.command);
    element.componentName = 'core:action';
    element.properties = { command: action.command, label: action.label };
    element.slots = {};
    return element;
};

const elementFor = (component: ScreenComponentSyntax): JsonObject => {
    const exact = elementNameOf(component.properties.find(isElementName));
    return baseElement(component.stableId ?? component.name, exact ?? component.name);
};

// A `name "..."` property names the element rather than setting a component property.
const isElementName = (property: ComponentPropertySyntax): boolean =>
    property.property === nameProperty && !property.binding && elementNameOf(property) !== undefined;

const elementNameOf = (property: ComponentPropertySyntax | undefined): string | undefined => {
    const value = property?.value;
    if (!value || value.kind !== 'LiteralExpressionSyntax') return undefined;
    const literal = (value as { value?: unknown }).value;
    return typeof literal === 'string' ? literal : undefined;
};

export const sceneComponentName = (component: string): string => {
    const dotted = dottedPackages.find(name => component.startsWith(name + '.'));
    if (dotted !== undefined) return `${dotted}:${component.slice(dotted.length + 1)}`;
    const separator = component.indexOf('.');
    return separator < 0 ? component : `${component.slice(0, separator)}:${component.slice(separator + 1)}`;
};
