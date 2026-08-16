// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { numberProperty } from '../properties';
import { TabMenu } from './TabMenu';

/**
 * The `PrimeReact:tabMenu` component - tabs used for navigation rather than for hiding content.
 *
 * PrimeReact 11 removed `tabmenu` with nothing to replace it, so what this adapts is Scene's own
 * {@link TabMenu}. `primereact/tabs` does exist in v11 and looks like the obvious substitute, but it is
 * built for tabs that control panels; a navigation bar has none, and adopting it would announce panels
 * that are not there. Scene's replacement keeps the look and tells the truth about the semantics.
 *
 * The selected entry is held by the component itself so the control responds to clicks in a preview,
 * exactly as the v10 adapter did; the authored `activeIndex` is where it starts.
 */
export function PrimeTabMenu({ element }: RegisteredComponentProps) {
    return <TabMenu data-scene-id={element.id} items={menuItemsProperty(element, 'items')} activeIndex={numberProperty(element, 'activeIndex', 0)} />;
}
