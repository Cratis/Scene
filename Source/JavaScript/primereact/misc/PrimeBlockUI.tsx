// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlockUI } from 'primereact/blockui';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty } from '../properties';

/**
 * The `PrimeReact:blockUI` component - a region masked while something is in flight.
 *
 * In PrimeReact 11 this component is removed with no direct replacement.
 */
export function PrimeBlockUI({ element, slots }: RegisteredComponentProps) {
    return (
        <BlockUI data-scene-id={element.id} blocked={booleanProperty(element, 'blocked', true)}>
            {slots.content}
        </BlockUI>
    );
}
