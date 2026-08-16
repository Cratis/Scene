// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { SplitButton } from './SplitButton';
import { booleanProperty, stringProperty } from '../properties';
import { menuItemsProperty } from '../menuItems';

/**
 * The `PrimeReact:splitButton` component - a primary action with a dropdown of related ones.
 *
 * PrimeReact 11 removed `SplitButton` with no replacement and no headless hook, so the adapter renders
 * Cratis's own {@link SplitButton}, itself composed from the `Button` and `Popover` that survived. Nothing
 * about the element's contract changed, which is the whole point of having an adapter layer at all.
 *
 * The secondary actions come from an `items` property rather than from slots, because they are data - a
 * list of labels and icons - and feeding a menu rendered React nodes would give it nothing to show in its
 * rows. `menuItemsProperty` is the same reader every other menu in this package uses, so a screen writes
 * items the same way here as it does for a menubar.
 */
export function PrimeSplitButton({ element }: RegisteredComponentProps) {
    return (
        <SplitButton
            data-scene-id={element.id}
            label={stringProperty(element, 'label')}
            icon={stringProperty(element, 'icon')}
            severity={stringProperty(element, 'severity')}
            items={menuItemsProperty(element, 'items')}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
