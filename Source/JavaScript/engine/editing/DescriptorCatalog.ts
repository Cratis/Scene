// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, LayoutTypeDescriptor } from '@cratis/scene.model';
import { layoutTypeDescriptors } from './layoutTypeDescriptors';

/**
 * Everything an editor knows how to describe: the component descriptors packages contribute, and the layout types
 * the model itself defines.
 *
 * It is a derived view over what packages ship - not a registry anything registers into. Build one from the
 * descriptors of the packages a profile lists, and rebuild it when the list changes.
 */
export interface DescriptorCatalog {
    components: ComponentDescriptor[];
    layoutTypes: LayoutTypeDescriptor[];
}

/**
 * Builds a catalog from the component descriptors of the active packages, plus the built-in layout types.
 *
 * When two descriptors name the same component the later one wins, which is the same override-priority rule
 * the profile's package order already means for components.
 */
export function createDescriptorCatalog(componentDescriptors: ComponentDescriptor[] = []): DescriptorCatalog {
    const byComponent = new Map<string, ComponentDescriptor>();
    for (const descriptor of componentDescriptors) byComponent.set(descriptor.component, descriptor);

    return { components: [...byComponent.values()], layoutTypes: layoutTypeDescriptors };
}

/**
 * Finds the descriptor of a component by the name an element carries.
 *
 * An exact match wins. Otherwise a bare name (`dataTable`) finds the one descriptor whose component ends in
 * `:dataTable`; a bare name that several packages describe has no single answer, so it finds none.
 */
export function findComponentDescriptor(catalog: DescriptorCatalog, componentName: string): ComponentDescriptor | undefined {
    const exact = catalog.components.find(descriptor => descriptor.component === componentName);
    if (exact) return exact;

    const matches = catalog.components.filter(descriptor => descriptor.component.endsWith(`:${componentName}`));
    return matches.length === 1 ? matches[0] : undefined;
}

/**
 * Finds the descriptor of a layout type.
 */
export function findLayoutTypeDescriptor(catalog: DescriptorCatalog, type: string): LayoutTypeDescriptor | undefined {
    return catalog.layoutTypes.find(descriptor => descriptor.type === type);
}
