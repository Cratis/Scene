// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BreadCrumb } from 'primereact/breadcrumb';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:breadcrumb` component - the path to where the user currently is.
 *
 * The home entry is separate from the trail in PrimeReact's model, so it is read from its own `homeUrl`
 * property and always rendered as an icon.
 */
export function PrimeBreadcrumb({ element }: RegisteredComponentProps) {
    return (
        <BreadCrumb
            data-scene-id={element.id}
            model={menuItemsProperty(element, 'items')}
            home={{ icon: 'pi pi-home', url: stringProperty(element, 'homeUrl', '/') }}
        />
    );
}
