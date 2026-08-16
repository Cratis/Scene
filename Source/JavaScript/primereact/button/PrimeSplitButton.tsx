// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SplitButton } from 'primereact/splitbutton';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';
import { menuItemsProperty } from '../menuItems';

/**
 * The `PrimeReact:splitButton` component - a primary action with a dropdown of related ones.
 *
 * The secondary actions come from an `items` property rather than from slots, because PrimeReact drives
 * them from a data model and not from children; feeding it rendered React nodes would give it no labels
 * to show.
 */
export function PrimeSplitButton({ element }: RegisteredComponentProps) {
    return (
        <SplitButton
            data-scene-id={element.id}
            label={stringProperty(element, 'label')}
            icon={stringProperty(element, 'icon')}
            model={menuItemsProperty(element, 'items')}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
