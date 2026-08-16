// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OrganizationChart, type OrganizationChartNodeRow } from 'primereact/organizationchart';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { treeNodesProperty } from '../treeNodes';
import { toPrimeTreeNodes } from './primeTreeNodes';

/**
 * The `PrimeReact:organizationChart` component - a hierarchy drawn top-down as connected boxes.
 *
 * Takes the same node model as `tree` and `treeSelect`, so one authored hierarchy can be shown three
 * different ways without being restructured.
 *
 * PrimeReact 10 threw on an empty `value`: it read the root node's `expanded` flag without checking there
 * was a root, so an element whose nodes had not been authored yet took the whole screen down with it, and
 * this adapter had to guard against its own empty case. PrimeReact 11 defaults the node list everywhere
 * it reads it, and `OrganizationChart.Nodes` simply renders an empty subtree, so the guard is gone and
 * an unconfigured chart renders as nothing rather than as an exception.
 *
 * The node body is declared once and applied to every node by the root's own recursion - `Nodes` invokes
 * this child for each root node and each expanded node hands the same function down to its children, so
 * there is no depth to walk here.
 */
export function PrimeOrganizationChart({ element }: RegisteredComponentProps) {
    return (
        <OrganizationChart.Root data-scene-id={element.id} value={toPrimeTreeNodes(treeNodesProperty(element, 'nodes'))}>
            <OrganizationChart.Nodes>
                {(row: OrganizationChartNodeRow) => (
                    <OrganizationChart.Node uKey={row.node.key}>
                        <OrganizationChart.Content>
                            <OrganizationChart.Label />
                        </OrganizationChart.Content>
                        <OrganizationChart.Toggle>
                            <OrganizationChart.ToggleIndicator match='collapsed'>▾</OrganizationChart.ToggleIndicator>
                            <OrganizationChart.ToggleIndicator match='expanded'>▴</OrganizationChart.ToggleIndicator>
                        </OrganizationChart.Toggle>
                    </OrganizationChart.Node>
                )}
            </OrganizationChart.Nodes>
        </OrganizationChart.Root>
    );
}
