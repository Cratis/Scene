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
 */
export function PrimeOrganizationChart({ element }: RegisteredComponentProps) {
    return <OrganizationChart data-scene-id={element.id} value={treeNodesProperty(element, 'nodes')} />;
}
