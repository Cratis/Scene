// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Rating } from 'primereact/rating';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty } from '../properties';

/**
 * The `PrimeReact:rating` component - a star rating.
 */
export function PrimeRating({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<number | undefined>(numberProperty(element, 'value'));
    return (
        <Rating
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(typeof event.value === 'number' ? event.value : undefined)}
            stars={numberProperty(element, 'stars', 5)}
            cancel={booleanProperty(element, 'cancel', true)}
            readOnly={booleanProperty(element, 'readOnly', false)}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
