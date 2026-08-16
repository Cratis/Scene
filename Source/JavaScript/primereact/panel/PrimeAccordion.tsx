// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Accordion } from 'primereact/accordion';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, stringArrayProperty } from '../properties';

/**
 * The `PrimeReact:accordion` component - stacked sections of which one is open at a time.
 *
 * Sections are paired by position: the `headers` property gives the titles and the `content` slot gives
 * the bodies. That pairing is a consequence of the Scene model rather than of PrimeReact - a slot arrives
 * as a flat list of already-rendered children with nowhere to hang a per-child title - so a screen puts as
 * many children in the slot as it lists headers.
 *
 * PrimeReact 11 replaced `AccordionTab` with a `Accordion.Panel` / `Header` / `Trigger` / `Content`
 * composition keyed by an explicit `value`, which retires the v10 constraint that sections had to *be*
 * `AccordionTab` elements for the accordion to recognize them. The index doubles as that value, so the
 * `activeIndex` property still means what it always did. It is passed as `defaultValue` rather than
 * `value` because a screen states which section starts open - binding it as the controlled value would
 * pin the accordion to that section and silently swallow every click.
 */
export function PrimeAccordion({ element, slots }: RegisteredComponentProps) {
    const headers = stringArrayProperty(element, 'headers');
    const bodies = slots.content ?? [];
    const count = Math.max(headers.length, bodies.length);
    return (
        <Accordion.Root data-scene-id={element.id} defaultValue={String(numberProperty(element, 'activeIndex', 0))}>
            {Array.from({ length: count }, (_, index) => (
                <Accordion.Panel key={index} value={String(index)}>
                    <Accordion.Header>
                        <Accordion.Trigger>
                            {headers[index] ?? `Section ${index + 1}`}
                            <Accordion.Indicator match='open'>
                                <i className='pi pi-chevron-up' />
                            </Accordion.Indicator>
                            <Accordion.Indicator match='closed'>
                                <i className='pi pi-chevron-down' />
                            </Accordion.Indicator>
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content>{bodies[index]}</Accordion.Content>
                </Accordion.Panel>
            ))}
        </Accordion.Root>
    );
}
