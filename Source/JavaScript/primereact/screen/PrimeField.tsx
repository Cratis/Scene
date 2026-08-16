// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:field` component - one of Screenplay's screen directives: a labeled value.
 *
 * The label is bound to the value with `aria-labelledby` rather than left as two adjacent pieces of text,
 * so the pair is announced as one thing. When the `content` slot carries an editor, that editor is shown
 * instead of the static value - which is what lets the same directive serve a detail view and a form.
 */
export function PrimeField({ element, slots }: RegisteredComponentProps) {
    const labelId = `${element.id}-label`;
    return (
        <div data-scene-id={element.id} className='flex flex-col gap-1'>
            <span id={labelId} className='text-sm' style={{ color: 'var(--scene-text-muted-color)' }}>
                {stringProperty(element, 'label', '')}
            </span>
            <div aria-labelledby={labelId} style={{ color: 'var(--scene-text-color)' }}>
                {slots.content?.length ? slots.content : stringProperty(element, 'value', '')}
            </div>
        </div>
    );
}
