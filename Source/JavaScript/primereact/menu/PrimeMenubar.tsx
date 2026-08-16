// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { Menubar } from './Menubar';

/**
 * The `PrimeReact:menubar` component - a horizontal menu with nested submenus.
 *
 * The `start` and `end` slots take the branding and account controls that flank a real application's
 * menubar; the commands themselves come from the `items` property.
 *
 * PrimeReact 11 removed `menubar` with nothing to replace it, so what this adapts is Scene's own
 * {@link Menubar}. The registered name and the authored properties are unchanged, which is the point -
 * a screen written against the PrimeReact 10 package keeps working, and the substitution shows up as a
 * shorter list of behaviors rather than as a broken screen.
 */
export function PrimeMenubar({ element, slots }: RegisteredComponentProps) {
    return <Menubar data-scene-id={element.id} items={menuItemsProperty(element, 'items')} start={slots.start} end={slots.end} />;
}
