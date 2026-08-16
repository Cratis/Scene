// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Steps } from 'primereact/steps';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { booleanProperty, numberProperty } from '../properties';

/**
 * The `PrimeReact:steps` component - progress through a sequence, shown as numbered labels.
 *
 * Unlike `stepper` this shows position only and owns no content; a screen pairs it with whatever it
 * wants to render per step.
 */
export function PrimeSteps({ element }: RegisteredComponentProps) {
    const [activeIndex, setActiveIndex] = useState(numberProperty(element, 'activeIndex', 0));
    return (
        <Steps
            data-scene-id={element.id}
            model={menuItemsProperty(element, 'items')}
            activeIndex={activeIndex}
            readOnly={booleanProperty(element, 'readOnly', false)}
            onSelect={(event) => setActiveIndex(event.index)}
        />
    );
}
