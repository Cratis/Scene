// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { booleanProperty } from '../properties';
import { PanelMenu } from './PanelMenu';

/**
 * The `PrimeReact:panelMenu` component - a vertical menu whose submenus expand in place, accordion style.
 *
 * PrimeReact 11 removed `panelmenu` with nothing to replace it, so what this adapts is Scene's own
 * {@link PanelMenu}. That replacement is the least hand-rolled of the seven in this folder: v11 still ships
 * `accordion`, and an accordion is exactly what a panel menu's expand-and-collapse behavior is, so only the
 * mapping from the authored item model onto those parts is Scene's.
 */
export function PrimePanelMenu({ element }: RegisteredComponentProps) {
    return <PanelMenu data-scene-id={element.id} items={menuItemsProperty(element, 'items')} multiple={booleanProperty(element, 'multiple', false)} />;
}
