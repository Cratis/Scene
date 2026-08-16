// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SpeedDial } from 'primereact/speeddial';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';
import { menuItemsProperty } from '../menuItems';

/**
 * The `PrimeReact:speedDial` component - a floating action button that fans its actions out on hover.
 *
 * Rendered inside a sized, relatively positioned box because SpeedDial positions itself absolutely
 * against its nearest positioned ancestor; dropped straight into a Scene tree it would otherwise anchor
 * itself to the page and float over unrelated content.
 */
export function PrimeSpeedDial({ element }: RegisteredComponentProps) {
    return (
        <div data-scene-id={element.id} className='relative h-40 w-40'>
            <SpeedDial
                model={menuItemsProperty(element, 'items')}
                direction={stringProperty(element, 'direction', 'up') as 'up' | 'down' | 'left' | 'right'}
                type={stringProperty(element, 'type', 'linear') as 'linear' | 'circle' | 'semi-circle' | 'quarter-circle'}
            />
        </div>
    );
}
