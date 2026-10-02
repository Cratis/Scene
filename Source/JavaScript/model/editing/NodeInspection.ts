// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutCapabilities } from '../descriptors';
import { InspectedProperty } from './InspectedProperty';
import { NodeProvenance } from './NodeProvenance';
import { SceneDiagnostic } from './SceneDiagnostic';
import { SceneNodeKind } from './SceneNodeKind';

/**
 * What an editor needs to know about one node: what it is, where it comes from, what can be edited on it and
 * what can be done with it.
 */
export interface NodeInspection {
    nodeId: string;
    kind: `${SceneNodeKind}`;

    /**
     * What sort of node: a {@link LayoutType} for a layout node, the component name for an element
     * that is a component, otherwise the element's kind.
     */
    typeId: string;

    /** A name for a tree or an inspector title. */
    label: string;

    /** The id of the node that contains this one, when there is one. */
    parentId?: string;

    provenance: NodeProvenance;

    /** Every property with a descriptor, with its values and editability. */
    properties: InspectedProperty[];

    /** For a layout node: what the layout type can do. */
    capabilities?: LayoutCapabilities;

    /** Whether the node can be removed or moved by the editing scope. */
    removable: boolean;

    diagnostics: SceneDiagnostic[];
}

export const NodeInspectionPropertyNames: (keyof NodeInspection)[] = [
    'nodeId', 'kind', 'typeId', 'label', 'parentId', 'provenance', 'properties', 'capabilities', 'removable', 'diagnostics',
];
