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
 *
 * PrimeReact 11 turned `Card` into a namespace of parts, so the v10 `title` / `subTitle` props no longer
 * exist - the caption is something the adapter assembles. The caption block is omitted entirely when a
 * screen supplies neither, because an empty `Card.Caption` still reserves its spacing and would leave an
 * unexplained gap above the body of an untitled card.
 */
export function PrimeCard({ element, slots }: RegisteredComponentProps) {
    const title = stringProperty(element, 'title');
    const subtitle = stringProperty(element, 'subtitle');
    return (
        <Card.Root data-scene-id={element.id}>
            <Card.Body>
                {(title !== undefined || subtitle !== undefined) && (
                    <Card.Caption>
                        {title !== undefined && <Card.Title>{title}</Card.Title>}
                        {subtitle !== undefined && <Card.Subtitle>{subtitle}</Card.Subtitle>}
                    </Card.Caption>
                )}
                <Card.Content>{slots.content}</Card.Content>
            </Card.Body>
        </Card.Root>
    );
}
