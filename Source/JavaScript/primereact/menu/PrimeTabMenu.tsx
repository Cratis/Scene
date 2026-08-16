// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { numberProperty } from '../properties';

/**
 * The `PrimeReact:tabMenu` component - tabs used for navigation rather than for hiding content.
 *
 * The selected tab is held locally so the control responds to clicks in a preview.
 *
 * In PrimeReact 11 this component is removed; navigation tabs are built from `Tabs` instead.
 */
export function PrimeTabMenu({ element }: RegisteredComponentProps) {
    const [activeIndex, setActiveIndex] = useState(numberProperty(element, 'activeIndex', 0));
    return (
        <TabMenu
            data-scene-id={element.id}
            model={menuItemsProperty(element, 'items')}
            activeIndex={activeIndex}
            onTabChange={(event) => setActiveIndex(event.index)}
        />
    );
}
