// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    ComponentDescriptor, ComponentDesignModeDescriptor, DiagnosticCode, DiagnosticSeverity, PropertyDescriptor, PropertyEditorKind, PropertyValueType,
    SceneDiagnostic, componentCategories,
} from '@cratis/scene.model';

/**
 * Checks the component metadata a package ships - what a picker and a designer read without loading a component.
 *
 * - **CMP1** `componentCategoryMissing` (error): a registered component has no descriptor, or its descriptor declares no category.
 * - `componentCategoryUnknown` (warning): the category is not one of the model's; a package may add its own, so this is a
 *   nudge towards the shared vocabulary, not a refusal.
 * - `componentDesignModeInvalid` (error): the design-mode descriptor names an items or collection path that is not a `Collection`
 *   property of the component, or repeats an action id.
 * - `propertyEditorOptionsInvalid` (error): an editor's parameters cannot work - a `reference` editor that does not say what it
 *   references, a step that is not positive, an empty list of slice kinds.
 *
 * `registered` is the bare or package-qualified names of the components the package registers; when given, each must be described.
 * The result is in a stable order: registered components first (in the order given), then each descriptor's findings in its own order.
 */
export function validateComponentDescriptors(
    descriptors: readonly ComponentDescriptor[],
    registered?: readonly string[],
    knownCategories: readonly string[] = componentCategories
): SceneDiagnostic[] {
    const diagnostics: SceneDiagnostic[] = [];
    const described = new Map(descriptors.map(descriptor => [descriptor.component, descriptor]));

    for (const component of registered ?? []) {
        if (!described.has(component)) {
            diagnostics.push(missingCategory(component, `'${component}' is registered but has no descriptor, so it declares no category`));
        }
    }

    for (const descriptor of descriptors) {
        const { component } = descriptor;

        if (descriptor.category === undefined || descriptor.category.trim().length === 0) {
            diagnostics.push(missingCategory(component, `'${component}' declares no category`));
        } else if (!knownCategories.includes(descriptor.category)) {
            diagnostics.push({
                code: DiagnosticCode.ComponentCategoryUnknown, severity: DiagnosticSeverity.Warning, component,
                message: `'${component}' declares the category '${descriptor.category}', which is not one of ${knownCategories.join(', ')}`,
            });
        }

        if (descriptor.designMode) {
            diagnostics.push(...validateDesignMode(descriptor, descriptor.designMode));
        }

        diagnostics.push(...validateEditorOptions(component, descriptor.properties, ''));
    }

    return diagnostics;
}

function missingCategory(component: string, message: string): SceneDiagnostic {
    return { code: DiagnosticCode.ComponentCategoryMissing, severity: DiagnosticSeverity.Error, component, message };
}

function invalidDesignMode(component: string, message: string): SceneDiagnostic {
    return { code: DiagnosticCode.ComponentDesignModeInvalid, severity: DiagnosticSeverity.Error, component, message };
}

function validateDesignMode(descriptor: ComponentDescriptor, designMode: ComponentDesignModeDescriptor): SceneDiagnostic[] {
    const { component } = descriptor;
    const diagnostics: SceneDiagnostic[] = [];
    const collections = new Set(descriptor.properties.filter(property => property.valueType === PropertyValueType.Collection).map(property => property.path));

    if (designMode.itemsPath !== undefined && !collections.has(designMode.itemsPath)) {
        diagnostics.push(invalidDesignMode(component, `'${component}' names '${designMode.itemsPath}' as its design-mode items, which is not one of its Collection properties`));
    }

    const seenAdd = new Set<string>();
    for (const action of designMode.addActions) {
        if (seenAdd.has(action.id)) diagnostics.push(invalidDesignMode(component, `'${component}' declares the design-mode add action '${action.id}' more than once`));
        seenAdd.add(action.id);

        if (action.collectionPath !== undefined && !collections.has(action.collectionPath)) {
            diagnostics.push(invalidDesignMode(component, `the design-mode add action '${action.id}' of '${component}' adds to '${action.collectionPath}', which is not one of its Collection properties`));
        }
    }

    const seenItem = new Set<string>();
    for (const action of designMode.itemToolbar) {
        if (seenItem.has(action.id)) diagnostics.push(invalidDesignMode(component, `'${component}' declares the design-mode item action '${action.id}' more than once`));
        seenItem.add(action.id);
    }

    return diagnostics;
}

function validateEditorOptions(component: string, properties: readonly PropertyDescriptor[], parent: string): SceneDiagnostic[] {
    const diagnostics: SceneDiagnostic[] = [];
    const invalid = (path: string, message: string): SceneDiagnostic => ({
        code: DiagnosticCode.PropertyEditorOptionsInvalid, severity: DiagnosticSeverity.Error, component, path, message: `'${component}' property '${path}' ${message}`,
    });

    for (const property of properties) {
        const path = `${parent}${property.path}`;
        const options = property.editorOptions;

        if (property.editorKind === PropertyEditorKind.Reference && !options?.reference?.target) {
            diagnostics.push(invalid(path, "uses the 'reference' editor without saying what it references (editorOptions.reference.target)"));
        }

        if (options?.step !== undefined && !(options.step > 0)) {
            diagnostics.push(invalid(path, 'declares a step that is not greater than zero'));
        }

        if (options?.kinds !== undefined && options.kinds.length === 0) {
            diagnostics.push(invalid(path, 'declares an empty list of kinds, which would offer nothing'));
        }

        if (property.item) diagnostics.push(...validateEditorOptions(component, property.item.properties, `${path}[].`));
        if (property.properties) diagnostics.push(...validateEditorOptions(component, property.properties, `${path}.`));
    }

    return diagnostics;
}
