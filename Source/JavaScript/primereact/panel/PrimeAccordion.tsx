// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Accordion, AccordionTab } from 'primereact/accordion';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, stringArrayProperty } from '../properties';

/**
 * The `PrimeReact:accordion` component - stacked sections of which one is open at a time.
 *
 * Accordion identifies its sections by React element type (`AccordionTab`), so a Scene adapter wrapping
 * one would not be recognized. Sections are therefore paired here: the `headers` property gives the
 * titles and the `content` slot gives the bodies, matched by position. A screen puts as many children in
 * the slot as it lists headers.
 */
export function PrimeAccordion({ element, slots }: RegisteredComponentProps) {
    const headers = stringArrayProperty(element, 'headers');
    const bodies = slots.content ?? [];
    const count = Math.max(headers.length, bodies.length);
    return (
        <Accordion data-scene-id={element.id} activeIndex={numberProperty(element, 'activeIndex', 0)}>
            {Array.from({ length: count }, (_, index) => (
                <AccordionTab key={index} header={headers[index] ?? `Section ${index + 1}`}>
                    {bodies[index]}
                </AccordionTab>
            ))}
        </Accordion>
    );
}
