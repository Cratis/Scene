// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Timeline } from 'primereact/timeline';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { recordArrayProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:timeline` component - events laid out along an axis.
 *
 * PrimeReact 11 replaced the `value` / `content` / `opposite` render props with a composition: a root
 * that carries only alignment and orientation, and event, opposite, separator, marker, connector and
 * content parts the caller assembles per event. The adapter walks the events itself and builds that
 * structure from the `titleField`, `descriptionField` and `dateField` properties.
 *
 * The connector is left off the last event on purpose - it is the line *between* two events, and drawing
 * one after the final marker makes the timeline look truncated rather than finished.
 *
 * The authored property is still called `layout`, as in PrimeReact 10, even though the prop it feeds is
 * now `orientation`; renaming it would break every screen for no gain the author can see.
 */
export function PrimeTimeline({ element }: RegisteredComponentProps) {
    const titleField = stringProperty(element, 'titleField', 'title');
    const descriptionField = stringProperty(element, 'descriptionField', 'description');
    const dateField = stringProperty(element, 'dateField', 'date');
    const events = recordArrayProperty(element, 'events');

    return (
        <Timeline.Root
            data-scene-id={element.id}
            align={alignmentOf(stringProperty(element, 'align', 'left'))}
            orientation={orientationOf(stringProperty(element, 'layout', 'vertical'))}>
            {events.map((event, index) => (
                <Timeline.Event key={index}>
                    <Timeline.Opposite>
                        <span className='text-sm opacity-75'>{String(event[dateField] ?? '')}</span>
                    </Timeline.Opposite>
                    <Timeline.Separator>
                        <Timeline.Marker />
                        {index < events.length - 1 && <Timeline.Connector />}
                    </Timeline.Separator>
                    <Timeline.Content>
                        <div className='flex flex-col'>
                            <span className='font-semibold'>{String(event[titleField] ?? '')}</span>
                            <span className='text-sm opacity-75'>{String(event[descriptionField] ?? '')}</span>
                        </div>
                    </Timeline.Content>
                </Timeline.Event>
            ))}
        </Timeline.Root>
    );
}

function alignmentOf(value: string): 'left' | 'right' | 'alternate' | 'top' | 'bottom' {
    switch (value) {
        case 'right':
        case 'alternate':
        case 'top':
        case 'bottom':
            return value;
        default:
            return 'left';
    }
}

function orientationOf(value: string): 'horizontal' | 'vertical' {
    return value === 'horizontal' ? 'horizontal' : 'vertical';
}
