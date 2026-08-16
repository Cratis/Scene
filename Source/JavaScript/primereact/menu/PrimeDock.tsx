// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Dock } from 'primereact/dock';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:dock` component - a macOS-style dock of magnifying icons.
 *
 * Dock positions itself absolutely against its nearest positioned ancestor, so it is wrapped in a sized
 * relative box; dropped straight into a Scene tree it would otherwise pin itself to the page.
 *
 * In PrimeReact 11 this component is removed with no direct replacement.
 */
export function PrimeDock({ element }: RegisteredComponentProps) {
    return (
        <div data-scene-id={element.id} className='relative h-40 w-full'>
            <Dock model={menuItemsProperty(element, 'items')} position={stringProperty(element, 'position', 'bottom') as 'top' | 'bottom' | 'left' | 'right'} />
        </div>
    );
}
