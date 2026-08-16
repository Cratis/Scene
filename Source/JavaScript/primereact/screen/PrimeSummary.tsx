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
 */
export function PrimeSummary({ element, slots }: RegisteredComponentProps) {
    const items = recordArrayProperty(element, 'items');
    return (
        <Card data-scene-id={element.id} title={stringProperty(element, 'title')}>
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
        </Card>
    );
}
