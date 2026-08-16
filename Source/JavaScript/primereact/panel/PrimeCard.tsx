// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Card } from 'primereact/card';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:card` component.
 *
 * One of the three names this package deliberately shares with `core` (alongside `text` and `button`), so
 * a profile that lists `core` and then `PrimeReact` upgrades every card on every screen to a themed one
 * without a single screen being edited.
 */
export function PrimeCard({ element, slots }: RegisteredComponentProps) {
    return (
        <Card data-scene-id={element.id} title={stringProperty(element, 'title')} subTitle={stringProperty(element, 'subtitle')}>
            {slots.content}
        </Card>
    );
}
