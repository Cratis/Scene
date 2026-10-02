// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    DiagnosticCode, LayoutCapabilities, LayoutType, PropertyDescriptor, SceneDiagnostic, SceneNodeKind,
} from '@cratis/scene.model';
import { DescriptorCatalog, findComponentDescriptor, findLayoutTypeDescriptor } from './DescriptorCatalog';
import { NodeRecord } from './DocumentIndex';
import { warningDiagnostic } from './diagnostics';
import { getValueAtPath } from './pathAccess';
import { placementProperties, templateProperties } from './layoutTypeDescriptors';

/**
 * What describes a node: its editable properties, and for a layout node what the type can do.
 */
export interface NodeDescription {
    properties: PropertyDescriptor[];
    capabilities?: LayoutCapabilities;
    diagnostics: SceneDiagnostic[];
}

const layoutTypes = new Set<string>(Object.values(LayoutType));

/**
 * Works out which descriptors apply to a node.
 *
 * A component takes its descriptor from the catalog by the name it carries; a layout node takes its layout type's;
 * a placement and a template have their own fixed sets. A component nothing describes has no editable
 * properties, and says so rather than failing.
 */
export function describeNode(record: NodeRecord, catalog: DescriptorCatalog): NodeDescription {
    const diagnostics: SceneDiagnostic[] = [];

    if (record.kind === SceneNodeKind.Placement) return { properties: placementProperties, diagnostics };
    if (record.kind === SceneNodeKind.ScreenTemplate || record.kind === SceneNodeKind.DialogTemplate) return { properties: templateProperties, diagnostics };

    if (layoutTypes.has(record.typeId)) {
        const descriptor = findLayoutTypeDescriptor(catalog, record.typeId);
        return { properties: descriptor?.properties ?? [], capabilities: descriptor?.capabilities, diagnostics };
    }

    if (record.kind === SceneNodeKind.Element && (record.value as { componentName?: unknown }).componentName !== undefined) {
        const descriptor = findComponentDescriptor(catalog, record.typeId);
        if (!descriptor) {
            diagnostics.push(warningDiagnostic(DiagnosticCode.MissingComponentDescriptor, `Nothing describes the component '${record.typeId}', so none of its properties can be edited.`, { nodeId: record.id }));
        }

        return { properties: descriptor?.properties ?? [], diagnostics };
    }

    return { properties: [], diagnostics };
}

/**
 * Reads a descriptor's value from a node: from the property bag of a component, from the node itself otherwise.
 */
export function readNodeValue(record: NodeRecord, path: string): unknown {
    const value = record.value as Record<string, unknown>;
    const isComponent = record.kind === SceneNodeKind.Element && value.componentName !== undefined;
    return getValueAtPath(isComponent ? (value.properties as Record<string, unknown>) : value, path);
}
