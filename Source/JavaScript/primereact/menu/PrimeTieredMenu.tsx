// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { TieredMenu } from './TieredMenu';

/**
 * The `PrimeReact:tieredMenu` component - a vertical menu whose submenus open to the side.
 *
 * PrimeReact 11 removed `tieredmenu` with nothing to replace it, so what this adapts is Scene's own
 * {@link TieredMenu}. It is the one component in this family that keeps unlimited nesting, which is why an
 * authored menu that genuinely goes three levels deep belongs here rather than in a `menubar`.
 */
export function PrimeTieredMenu({ element }: RegisteredComponentProps) {
    return <TieredMenu data-scene-id={element.id} items={menuItemsProperty(element, 'items')} />;
}
