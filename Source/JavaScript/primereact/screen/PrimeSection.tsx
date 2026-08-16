// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Divider } from 'primereact/divider';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:section` component - one of Screenplay's screen directives: a titled grouping.
 *
 * A real `<section>` with a heading, not a styled `div`: the grouping is the point of the directive, and
 * only the semantic element actually creates one for assistive technology. The rule under the heading is
 * PrimeReact's `Divider`, so the separation is themed with everything else rather than hard-coded.
 */
export function PrimeSection({ element, slots }: RegisteredComponentProps) {
    const title = stringProperty(element, 'title');
    return (
        <section data-scene-id={element.id} className='flex flex-col'>
            {title !== undefined && (
                <>
                    <h2 className='text-lg font-semibold' style={{ color: 'var(--scene-text-color)' }}>
                        {title}
                    </h2>
                    <Divider />
                </>
            )}
            <div className='flex flex-col gap-3'>{slots.content}</div>
        </section>
    );
}
