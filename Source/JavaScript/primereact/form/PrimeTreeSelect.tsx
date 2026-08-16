// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { TreeSelect } from './TreeSelect';
import { booleanProperty, stringProperty } from '../properties';
import { treeNodesProperty } from '../treeNodes';

/**
 * The `PrimeReact:treeSelect` component - a dropdown whose choices are a hierarchy.
 *
 * The abstract name outlived the component: PrimeReact 11 removed `TreeSelect` with no replacement and no
 * headless hook, so what this adapts is {@link TreeSelect}, this package's own, built from v11's
 * `Popover` and `Tree`. Keeping the name is the point - a screen that already says `treeSelect` neither
 * knows nor needs to know that the thing behind it changed owner.
 *
 * v10's `filter` property is not read, because the replacement does not filter; see {@link TreeSelect}
 * for what else was left out and why.
 */
export function PrimeTreeSelect({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<string | undefined>(stringProperty(element, 'value'));
    return (
        <div data-scene-id={element.id}>
            <TreeSelect
                value={value}
                onChange={setValue}
                options={treeNodesProperty(element, 'options')}
                placeholder={stringProperty(element, 'placeholder', 'Select')}
                disabled={booleanProperty(element, 'disabled', false)}
            />
        </div>
    );
}
