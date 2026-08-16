// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PanelMenu } from 'primereact/panelmenu';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { booleanProperty } from '../properties';

/**
 * The `PrimeReact:panelMenu` component - a vertical menu whose submenus expand in place, accordion style.
 *
 * In PrimeReact 11 this component is removed with no direct replacement.
 */
export function PrimePanelMenu({ element }: RegisteredComponentProps) {
    return (
        <PanelMenu data-scene-id={element.id} model={menuItemsProperty(element, 'items')} multiple={booleanProperty(element, 'multiple', false)} />
    );
}
