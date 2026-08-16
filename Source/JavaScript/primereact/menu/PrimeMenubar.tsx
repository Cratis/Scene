// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Menubar } from 'primereact/menubar';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';

/**
 * The `PrimeReact:menubar` component - a horizontal menu with nested submenus.
 *
 * The `start` and `end` slots take the branding and account controls that flank a real application's
 * menubar; the commands themselves come from the `items` property.
 */
export function PrimeMenubar({ element, slots }: RegisteredComponentProps) {
    return <Menubar data-scene-id={element.id} model={menuItemsProperty(element, 'items')} start={slots.start} end={slots.end} />;
}
