// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Tabs } from 'primereact/tabs';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, stringArrayProperty } from '../properties';

/**
 * The `PrimeReact:tabView` component - content behind selectable tabs.
 *
 * Pairs a `headers` property with the `content` slot by position, for the same reason
 * {@link PrimeAccordion} does.
 *
 * PrimeReact 11 merged the v10 `primereact/tabview` and `primereact/tabpanel` modules into a single
 * compositional `primereact/tabs`, where the strip of tabs and the stack of panels are two sibling
 * subtrees joined by matching `value`s rather than one list of `TabPanel` elements read twice. The
 * adapter therefore walks the same range twice - once for `Tabs.List`, once for `Tabs.Panels` - and uses
 * the index as the shared value. `Tabs.Indicator` is composed in explicitly because v11 renders no part
 * it was not given, and without it the active tab gets no underline at all.
 *
 * `activeIndex` is passed as `defaultValue` rather than `value` for the reason described on
 * {@link PrimeAccordion}: a controlled value would make every tab unselectable.
 *
 * The abstract Scene name stays `tabView` so existing screens keep resolving.
 */
export function PrimeTabView({ element, slots }: RegisteredComponentProps) {
    const headers = stringArrayProperty(element, 'headers');
    const bodies = slots.content ?? [];
    const count = Math.max(headers.length, bodies.length);
    return (
        <Tabs.Root data-scene-id={element.id} defaultValue={String(numberProperty(element, 'activeIndex', 0))}>
            <Tabs.List>
                {Array.from({ length: count }, (_, index) => (
                    <Tabs.Tab key={index} value={String(index)}>
                        {headers[index] ?? `Tab ${index + 1}`}
                    </Tabs.Tab>
                ))}
                <Tabs.Indicator />
            </Tabs.List>
            <Tabs.Panels>
                {Array.from({ length: count }, (_, index) => (
                    <Tabs.Panel key={index} value={String(index)}>
                        {bodies[index]}
                    </Tabs.Panel>
                ))}
            </Tabs.Panels>
        </Tabs.Root>
    );
}
