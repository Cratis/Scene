// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Rating } from 'primereact/rating';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty } from '../properties';

/**
 * The `PrimeReact:rating` component - a star rating.
 *
 * `stars` is no longer a prop the component reads: PrimeReact 11 takes the stars as children, so the
 * count is what this adapter builds the `Rating.Option` list from, and the icons are ours to name -
 * `On` and `Off` are the filled and empty faces of one star. The upside of the change is that a rating
 * of hearts or flames is now a different icon class rather than a different component.
 *
 * v10's `cancel` property is not read. It rendered an extra leading icon that reset the rating to none;
 * v11 has no such part and no "clear" affordance, so there is nothing left to switch on.
 */
export function PrimeRating({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<number | undefined>(numberProperty(element, 'value'));
    const stars = numberProperty(element, 'stars', 5);
    return (
        <Rating.Root
            data-scene-id={element.id}
            value={value}
            onValueChange={(event) => setValue(event.value)}
            readOnly={booleanProperty(element, 'readOnly', false)}
            disabled={booleanProperty(element, 'disabled', false)}>
            {Array.from({ length: stars }, (_, index) => (
                <Rating.Option key={index} index={index} aria-label={`${index + 1} of ${stars}`}>
                    <Rating.On>
                        <i className='pi pi-star-fill' />
                    </Rating.On>
                    <Rating.Off>
                        <i className='pi pi-star' />
                    </Rating.Off>
                </Rating.Option>
            ))}
        </Rating.Root>
    );
}
