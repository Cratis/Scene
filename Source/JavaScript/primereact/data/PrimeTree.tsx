// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Tree } from 'primereact/tree';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty } from '../properties';
import { treeNodesProperty } from '../treeNodes';

/**
 * The `PrimeReact:tree` component - a hierarchy the user can expand and collapse.
 */
export function PrimeTree({ element }: RegisteredComponentProps) {
    return (
        <Tree
            data-scene-id={element.id}
            value={treeNodesProperty(element, 'nodes')}
            filter={booleanProperty(element, 'filter', false)}
            selectionMode={booleanProperty(element, 'selectable', false) ? 'single' : undefined}
        />
    );
}
