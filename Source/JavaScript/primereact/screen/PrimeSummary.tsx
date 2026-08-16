// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Card } from 'primereact/card';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { recordArrayProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:summary` component - one of Screenplay's screen directives: the headline facts about
 * one thing.
 *
 * Rendered as a description list inside a card. A description list is the correct element for
 * label/value pairs and gets the pairing across to a screen reader for free, which a grid of `div`s does
 * not.
 *
 * PrimeReact 11 made `Card` compositional, so the v10 `<Card title=...>` form is assembled here from
 * `Card.Root` / `Card.Body` / `Card.Caption` / `Card.Title` / `Card.Content` instead.
 *
 * The nesting matters and is easy to get wrong. `Card.Body` is the part that carries the padding - it is
 * the only one of them the preset gives a `padding` token - so everything visible has to sit inside it.
 * A title placed in a `Card.Header` instead renders flush to the card edge with no styling at all,
 * because `header` is not a themed part: the preset's `card` tokens are exactly `root`, `body`,
 * `caption`, `title` and `subtitle`, and `p-card-header` is v11's slot for a media image above the body.
 *
 * The caption is rendered only when a title was authored. v10 collapsed an absent `title` to nothing, and
 * an empty `Card.Caption` still reserves its own gap, which would leave a stray band above a summary that
 * simply has no heading.
 */
export function PrimeSummary({ element, slots }: RegisteredComponentProps) {
    const items = recordArrayProperty(element, 'items');
    const title = stringProperty(element, 'title');
    return (
        <Card.Root data-scene-id={element.id}>
            <Card.Body>
                {title !== undefined && (
                    <Card.Caption>
                        <Card.Title>{title}</Card.Title>
                    </Card.Caption>
                )}
                <Card.Content>
                <dl className='grid grid-cols-2 gap-2'>
                    {items.map((item, index) => (
                        <div key={index} className='flex flex-col'>
                            <dt className='text-sm' style={{ color: 'var(--scene-text-muted-color)' }}>
                                {String(item.label ?? '')}
                            </dt>
                            <dd style={{ color: 'var(--scene-text-color)' }}>{String(item.value ?? '')}</dd>
                        </div>
                    ))}
                </dl>
                    {slots.content}
                </Card.Content>
            </Card.Body>
        </Card.Root>
    );
}
