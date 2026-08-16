// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { MegaMenu } from 'primereact/megamenu';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:megaMenu` component - a menubar whose submenus open as multi-column panels.
 *
 * MegaMenu reads its columns from a doubly nested `items` model: each root entry's `items` is a list of
 * columns, and each column's `items` is the commands in it. `menuItemsProperty` follows the nesting to
 * any depth, so an author writes that shape directly.
 */
export function PrimeMegaMenu({ element }: RegisteredComponentProps) {
    return (
        <MegaMenu
            data-scene-id={element.id}
            model={menuItemsProperty(element, 'items')}
            orientation={stringProperty(element, 'orientation', 'horizontal') as 'horizontal' | 'vertical'}
        />
    );
}
