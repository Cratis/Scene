// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticSeverity, PropertyDescriptor, PropertyValueType, SceneDiagnostic, SceneDocument } from '@cratis/scene.model';
import { findComponentDescriptor } from './DescriptorCatalog';
import { EditingContext } from './EditingContext';
import { iconProblemsOfItems, iconProblemsOfProperty } from './iconDiagnostics';
import { getValueAtPath } from './pathAccess';
import { resolveEffectiveConfiguration } from './resolveEffectiveConfiguration';
import { resolveTemplateChain } from './resolveTemplateChain';

function isIconBearing(property: PropertyDescriptor): boolean {
    return property.valueType === PropertyValueType.Icon
        || (property.valueType === PropertyValueType.Collection && (property.item?.properties ?? []).some((field) => field.valueType === PropertyValueType.Icon));
}

/**
 * Reports every icon in what the editing scope renders - the template chain's own values and what each instance
 * contributed - that the profile's icon catalog cannot supply: a library the profile lacks, an icon or variant a
 * library no longer has, a library at an incompatible version.
 *
 * It reports; it never changes anything. The offending values stay in the document, still applied (a renderer
 * shows its fallback), and apply again as soon as the icon is available, so removing a library is reversible.
 * Each diagnostic names the component, property, collection item and - for a contributed value - the instance.
 *
 * Returns nothing when the context carries no `iconCatalog`. Load the catalogs first (`iconCatalog.load()`) for
 * definite answers; an icon from an unloaded library is reported as not verified.
 */
export function diagnoseIcons(document: SceneDocument, context: EditingContext): SceneDiagnostic[] {
    const iconCatalog = context.iconCatalog;
    if (!iconCatalog) return [];

    const chain = resolveTemplateChain(document, context.scope);
    const configuration = resolveEffectiveConfiguration(chain, document.instanceContributions, context.catalog);
    const diagnostics: SceneDiagnostic[] = [];

    for (const level of chain.levels) {
        for (const element of level.elements) {
            const descriptor = findComponentDescriptor(context.catalog, element.componentName);
            const configured = configuration.components.find((candidate) => candidate.component === element.id);

            for (const property of (descriptor?.properties ?? []).filter(isIconBearing)) {
                const effective = configured?.values.find((candidate) => candidate.path === property.path);
                const where = { component: element.id, ...(effective?.contributedBy === undefined ? {} : { instance: effective.contributedBy }) };

                if (property.valueType === PropertyValueType.Icon) {
                    const value = effective ? effective.value : getValueAtPath(element.properties, property.path);
                    diagnostics.push(...iconProblemsOfProperty(iconCatalog, property, value, DiagnosticSeverity.Warning, where));
                } else if (effective?.items) {
                    const items = effective.items.map((item) => ({ id: item.id, values: item.values, instance: item.origin === 'owner' ? undefined : item.origin }));
                    diagnostics.push(...iconProblemsOfItems(iconCatalog, property.item, items, DiagnosticSeverity.Warning, { component: element.id, path: property.path }));
                } else {
                    diagnostics.push(...iconProblemsOfProperty(iconCatalog, property, getValueAtPath(element.properties, property.path), DiagnosticSeverity.Warning, where));
                }
            }
        }
    }

    return diagnostics;
}
