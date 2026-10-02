// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InstanceContribution, PropertyDescriptor, PropertyValueType, SceneDocument } from '@cratis/scene.model';
import { IconUsage } from '../icons/IconUsage';
import { collectComponents } from './collectComponents';
import { DescriptorCatalog, findComponentDescriptor } from './DescriptorCatalog';
import { getValueAtPath } from './pathAccess';

function iconFields(property: PropertyDescriptor): string[] {
    return (property.item?.properties ?? []).filter((field) => field.valueType === PropertyValueType.Icon).map((field) => field.path);
}

function usagesOf(property: PropertyDescriptor, value: unknown, items: { id: string; values: Record<string, unknown> }[] | undefined, location: string): IconUsage[] {
    if (property.valueType === PropertyValueType.Icon) {
        return value === undefined ? [] : [{ value: value as IconUsage['value'], location: `${location}:${property.path}` }];
    }

    return property.valueType === PropertyValueType.Collection
        ? (items ?? []).flatMap((item) =>
              iconFields(property)
                  .filter((field) => item.values[field] !== undefined)
                  .map((field) => ({ value: item.values[field] as IconUsage['value'], location: `${location}:${property.path}:${item.id}:${field}` })))
        : [];
}

function ownerItems(value: unknown): { id: string; values: Record<string, unknown> }[] {
    return (Array.isArray(value) ? value : [])
        .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
        .map(({ id, ...values }) => ({ id: String(id), values }));
}

/**
 * Finds every icon value stored anywhere in a document - the values components carry themselves, and the values
 * and collection-item icon fields that template instances contributed - as the `IconUsage`s that
 * `analyzeIconImpact` takes, so "what would removing this library break" can be asked of a whole document.
 *
 * Each usage's `location` reads `<owner or instance>:<component>:<path>[:<itemId>:<field>]`, where the first part is
 * the contributing instance id (`screen:Orders`) for a contributed value and the name of the owning layout or
 * template for a value the component carries. Values are read as stored; none are changed.
 *
 * @param document The document to read.
 * @param catalog The descriptors saying which properties are icons.
 */
export function collectIconUsages(document: SceneDocument, catalog: DescriptorCatalog): IconUsage[] {
    const usages: IconUsage[] = [];
    const componentNames = new Map<string, string>();

    const owners: { name: string; value: unknown }[] = [
        ...document.layouts.map((layout) => ({ name: layout.name, value: layout })),
        ...document.screenTemplates.map((template) => ({ name: template.name, value: template })),
        ...document.dialogTemplates.map((template) => ({ name: template.name, value: template })),
        ...document.screens.map((screen) => ({ name: screen.name, value: screen })),
    ];

    for (const owner of owners) {
        for (const component of collectComponents(owner.value)) {
            if (!componentNames.has(component.id)) componentNames.set(component.id, component.componentName);

            for (const property of findComponentDescriptor(catalog, component.componentName)?.properties ?? []) {
                const value = getValueAtPath(component.properties, property.path);
                usages.push(...usagesOf(property, value, ownerItems(value), `${owner.name}:${component.id}`));
            }
        }
    }

    for (const contribution of document.instanceContributions) {
        const componentName = componentNames.get(contribution.component);
        const property = componentName === undefined ? undefined : findComponentDescriptor(catalog, componentName)?.properties.find((candidate) => candidate.path === contribution.path);
        if (property) usages.push(...contributedUsages(property, contribution));
    }

    return usages;
}

function contributedUsages(property: PropertyDescriptor, contribution: InstanceContribution): IconUsage[] {
    return usagesOf(property, contribution.value, contribution.items, `${contribution.instance}:${contribution.component}`);
}
