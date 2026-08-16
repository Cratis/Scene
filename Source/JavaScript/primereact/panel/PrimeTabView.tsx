// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TabPanel, TabView } from 'primereact/tabview';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, stringArrayProperty } from '../properties';

/**
 * The `PrimeReact:tabView` component - content behind selectable tabs.
 *
 * Pairs a `headers` property with the `content` slot by position, for the same reason
 * {@link PrimeAccordion} does.
 *
 * In PrimeReact 11 `TabView` and `TabPanel` are replaced by a single `Tabs` component.
 */
export function PrimeTabView({ element, slots }: RegisteredComponentProps) {
    const headers = stringArrayProperty(element, 'headers');
    const bodies = slots.content ?? [];
    const count = Math.max(headers.length, bodies.length);
    return (
        <TabView data-scene-id={element.id} activeIndex={numberProperty(element, 'activeIndex', 0)}>
            {Array.from({ length: count }, (_, index) => (
                <TabPanel key={index} header={headers[index] ?? `Tab ${index + 1}`}>
                    {bodies[index]}
                </TabPanel>
            ))}
        </TabView>
    );
}
