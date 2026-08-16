// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Tooltip } from '@cratis/components/Common';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty, unionProperty } from '../properties';

/** Which side of the wrapped content the tooltip appears on. */
const positions = ['top', 'right', 'bottom', 'left'] as const;

/**
 * The `Cratis.Components:tooltip` component - `Tooltip` from `@cratis/components/Common`.
 *
 * Wraps whatever is in its `content` slot and explains it on hover. `disabled` exists so a screen can
 * keep the wrapper in place while turning the hint off, rather than restructuring the element tree to
 * remove it - the tree is authored, and a conditional wrapper would be a worse thing to model.
 */
export function SceneTooltip({ element, slots }: RegisteredComponentProps) {
    return (
        <Tooltip
            content={stringProperty(element.properties, 'content') ?? ''}
            position={unionProperty(element.properties, 'position', positions)}
            disabled={booleanProperty(element.properties, 'disabled')}
        >
            {slots.content}
        </Tooltip>
    );
}
