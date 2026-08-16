// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Menu } from 'primereact/menu';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';

/**
 * The `PrimeReact:menu` component - a flat list of commands.
 */
export function PrimeMenu({ element }: RegisteredComponentProps) {
    return <Menu data-scene-id={element.id} model={menuItemsProperty(element, 'items')} />;
}
