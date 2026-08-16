// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OrganizationChart } from 'primereact/organizationchart';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { treeNodesProperty } from '../treeNodes';

/**
 * The `PrimeReact:organizationChart` component - a hierarchy drawn top-down as connected boxes.
 *
 * Takes the same node model as `tree` and `treeSelect`, so one authored hierarchy can be shown three
 * different ways without being restructured.
 *
 * The empty case is guarded because PrimeReact's OrganizationChart reads the root node's `expanded` flag
 * without checking there is a root, and throws on an empty `value`. An element whose nodes have not been
 * authored yet is an ordinary state on a screen under construction; taking the whole screen down for it
 * would be the wrong failure.
 */
export function PrimeOrganizationChart({ element }: RegisteredComponentProps) {
    const nodes = treeNodesProperty(element, 'nodes');
    if (nodes.length === 0) return <div data-scene-id={element.id} />;
    return <OrganizationChart data-scene-id={element.id} value={nodes} />;
}
