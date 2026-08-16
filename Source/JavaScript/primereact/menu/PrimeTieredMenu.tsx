// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TieredMenu } from 'primereact/tieredmenu';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';

/**
 * The `PrimeReact:tieredMenu` component - a vertical menu whose submenus open to the side.
 */
export function PrimeTieredMenu({ element }: RegisteredComponentProps) {
    return <TieredMenu data-scene-id={element.id} model={menuItemsProperty(element, 'items')} />;
}
